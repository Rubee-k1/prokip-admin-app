
import React, { useState, useRef, useEffect } from 'react';
import { useAlert } from '../contexts/AlertContext';

interface AgentAgreementModalProps {
    isOpen: boolean;
    onSign: () => void;
}

const AgentAgreementModal: React.FC<AgentAgreementModalProps> = ({ isOpen, onSign }) => {
    const { showSuccess, showError } = useAlert();
    const [hasRead, setHasRead] = useState(false);
    const [fullName, setFullName] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSigned, setHasSigned] = useState(false); // Tracks if canvas has content
    const [showSignaturePad, setShowSignaturePad] = useState(false); // Controls the popup
    
    const contentRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Reset signature pad when showing popup
    useEffect(() => {
        if (showSignaturePad) {
            // Small timeout to ensure DOM is ready
            setTimeout(() => {
                const canvas = canvasRef.current;
                if (canvas) {
                    // Set canvas resolution for better quality
                    const rect = canvas.getBoundingClientRect();
                    canvas.width = rect.width;
                    canvas.height = rect.height;
                    
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        setHasSigned(false);
                    }
                }
            }, 50);
        }
    }, [showSignaturePad]);

    const handleScroll = () => {
        if (contentRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
            // Check if scrolled to bottom (with 50px buffer)
            if (scrollTop + clientHeight >= scrollHeight - 50) {
                setHasRead(true);
            }
        }
    };

    // Drawing Logic
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        const { x, y } = getCoordinates(e, canvas);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = '#0000CC'; // Blue ink
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCoordinates(e, canvas);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        if (!hasSigned) setHasSigned(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        ctx?.closePath();
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            setHasSigned(false);
        }
    };

    const handleProceedToSign = () => {
        if (!hasRead) {
            showError("Please read the entire agreement by scrolling to the bottom.");
            return;
        }
        if (!agreed) {
            showError("You must check the box to agree to the terms.");
            return;
        }
        setShowSignaturePad(true);
    };

    const handleSign = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (fullName.trim().length < 3) {
            showError("Please enter your full legal name.");
            return;
        }
        if (!hasSigned) {
            showError("Please sign the document in the signature box.");
            return;
        }

        setIsSubmitting(true);
        
        // Simulate API signing process
        setTimeout(() => {
            setIsSubmitting(false);
            showSuccess("Agreement signed successfully.");
            onSign();
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl relative flex flex-col h-[90vh]">
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-5 bg-slate-50 rounded-t-2xl shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[#02275A] text-white flex items-center justify-center text-xl shadow-lg shadow-blue-900/20">
                        <i className="fas fa-file-contract"></i>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Agent Service Agreement</h2>
                        <p className="text-sm text-slate-500 font-medium">Please review carefully before signing.</p>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div 
                    ref={contentRef}
                    onScroll={handleScroll}
                    className="flex-1 p-8 overflow-y-auto bg-white custom-scrollbar text-base text-slate-600 leading-8 space-y-6 border-b border-slate-100"
                >
                    <div className="space-y-4 mb-6">
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-bold flex items-start gap-3 shadow-sm">
                            <i className="fas fa-exclamation-triangle text-lg mt-0.5"></i>
                            <div>
                                <p className="uppercase tracking-wide text-xs text-amber-900 mb-1">Important Notice</p>
                                <p>You must read this entire agreement before signing. By signing this document, you are entering into a legally binding contract with Prokip Limited.</p>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-sm font-bold flex items-center gap-3 shadow-sm">
                            <i className="fas fa-info-circle text-lg"></i>
                            <p>You must scroll to the very end of this document to proceed.</p>
                        </div>
                    </div>

                    <div className="text-center mb-8 border-b border-slate-100 pb-6">
                        <h1 className="text-2xl font-extrabold text-slate-900 uppercase tracking-tight mb-1">Prokip Agent Agreement</h1>
                        <p className="text-slate-500 font-bold">Prokip Limited</p>
                    </div>

                    <div>
                        <p className="mb-4">
                            This Agent Agreement sets out the terms and conditions under which a Business Relationship Manager (BRM) operates as a Prokip agent under Prokip Limited. All agents must read, sign, and comply with this agreement before commencing work.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 uppercase text-sm tracking-widest mb-3 border-b border-slate-100 pb-2">1. Purpose and Mission Alignment</h3>
                        <p className="mb-4">
                            This document governs the working relationship between Prokip Limited and its appointed agents. It serves as a binding agreement and a professional guide for both management and agents, and must be signed by all agents as confirmation that they have read, understood, and agreed to all terms herein.
                        </p>
                        <p className="mb-4">
                            Prokip exists to empower businesses with powerful, transparent, and reliable business management systems that reduce losses, improve accountability, and increase profitability. Every Business Relationship Manager (BRM) is a direct ambassador of the Prokip brand and plays a critical role in advancing this mission.
                        </p>
                        <p>
                            Agents are therefore expected to uphold the highest standards of integrity, professionalism, discipline, and excellence in representing the company.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 uppercase text-sm tracking-widest mb-3 border-b border-slate-100 pb-2">2. Nature of Relationship</h3>
                        <p className="mb-4">
                            The Business Relationship Manager is appointed as an Authorised Independent Business Partner of Prokip Limited.
                        </p>
                        <p className="mb-4">
                            This role provides the Agent with professional autonomy, flexibility, and the opportunity to operate as a strategic growth representative of the Prokip brand while remaining aligned with company standards and policies.
                        </p>
                        <p className="mb-4">
                            This appointment does not create an employment relationship, partnership, or joint venture between the Agent and Prokip Limited. The Agent is responsible for their own statutory obligations and personal compliance requirements unless otherwise agreed in writing.
                        </p>
                        <p>
                            Prokip Limited recognises every BRM as a valued contributor to the company’s growth and national expansion.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 uppercase text-sm tracking-widest mb-3 border-b border-slate-100 pb-2">3. Eligibility</h3>
                        <p className="mb-2">
                            An individual is eligible to work as a Prokip agent if they can fulfil their duties regardless of other commitments, and if they demonstrate that they are trustworthy, disciplined, and self-motivated, with the capability and expertise to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-[#02275A]">
                            <li>Set up a Business Owner's operations on the Prokip platform</li>
                            <li>Provide prompt and competent support whenever a Business Owner requires it</li>
                            <li>Receive and execute instructions from the company promptly</li>
                            <li>Follow and comply fully with all company policies and procedures</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 uppercase text-sm tracking-widest mb-3 border-b border-slate-100 pb-2">4. Work Obligations</h3>
                        
                        <div className="space-y-6">
                            <div>
                                <span className="font-bold text-slate-800 block mb-1">4.1 Setup Timelines</span>
                                <p>
                                    All Prokip Business Owner setups must commence within 1 to 7 days of payment confirmation, except where the client requests a postponement or where a high volume of simultaneous sign-ups prevents the agent from attending to all within the stipulated time. In such cases, clients must be informed in advance and a mutually agreed scheduled date must be set. Where a client is outside the agent's location and travel is required, a written agreement on timing must be reached with the client before any visit is planned.
                                </p>
                            </div>

                            <div>
                                <span className="font-bold text-slate-800 block mb-1">4.2 Client Communication</span>
                                <p>
                                    Agents must keep all customers updated at all times and respond to complaints and inquiries promptly.
                                </p>
                            </div>

                            <div>
                                <span className="font-bold text-slate-800 block mb-1">4.3 Meetings</span>
                                <p>
                                    All company meetings are compulsory. Agents must be present at or before the scheduled meeting time. Agents must attend weekly and daily meetings as set by their state manager.
                                </p>
                            </div>

                            <div>
                                <span className="font-bold text-slate-800 block mb-1">4.4 Team Collaboration</span>
                                <p>
                                    Agents must respect, collaborate with, and respond to all team members in a timely and professional manner.
                                </p>
                            </div>

                            <div>
                                <span className="font-bold text-slate-800 block mb-1">4.5 Official Pricing</span>
                                <p className="mb-2">
                                    Agents must not sell Prokip at any price above the official company rate. Agents may only charge clients separately for approved add-on services, which are:
                                </p>
                                <ul className="list-disc pl-6 space-y-1 marker:text-[#02275A] mb-2">
                                    <li>Data entry service</li>
                                    <li>Logistics (travel outside the agent's city or additional visits beyond the Standard Number of Visits)</li>
                                    <li>Procurements</li>
                                    <li>Administrative assignments</li>
                                    <li>Auditing and management</li>
                                </ul>
                                <p>
                                    Training and complete setup must not be charged separately. Any agent found overcharging for Prokip itself will be required to refund the excess to the client and will face immediate dismissal.
                                </p>
                            </div>

                            <div>
                                <span className="font-bold text-slate-800 block mb-1">4.6 Company Integrity</span>
                                <p>
                                    Agents must uphold the company's reputation at all times and must honour any incentives or commitments made to clients on behalf of the company.
                                </p>
                            </div>

                            <div>
                                <span className="font-bold text-slate-800 block mb-1">4.7 Company Leads</span>
                                <p>
                                    Agents must not convert company-generated leads into personal one-on-one leads or exploit them in any way for personal gain.
                                </p>
                            </div>

                            <div>
                                <span className="font-bold text-slate-800 block mb-1">4.8 Commission Splits</span>
                                <p>
                                    When an agent closes a sale but is unable to perform the setup, and another agent carries it out, the closing agent (closer) forfeits 20% of the commission to the setup agent and retains the rest of the commission.
                                </p>
                            </div>

                            <div>
                                <span className="font-bold text-slate-800 block mb-1">4.9 Payments</span>
                                <p>
                                    Agents are not permitted to receive client payments into their personal bank accounts or the personal accounts of any other agent. All payments must be directed to the company's designated account.
                                </p>
                            </div>

                            <div>
                                <span className="font-bold text-slate-800 block mb-1">4.10 Agents'App Accuracy</span>
                                <p>
                                    Agents must not enter false or misleading information into the Agents'App tools (Leads and Invoices) regarding meetings, discussions, lead interactions or invoice details.
                                </p>
                            </div>

                            <div>
                                <span className="font-bold text-slate-800 block mb-1">4.11 Response Times</span>
                                <p>
                                    All agents must respond to messages from Management, state managers or fellow agents within a maximum of 2 hours. Chats must not be ignored beyond this threshold.
                                </p>
                            </div>

                            <div>
                                <span className="font-bold text-slate-800 block mb-1">4.12 Sales Process</span>
                                <p>
                                    All agents must follow the company's official sales process and Standard Operating Procedures, including use of the Agents'App and all other designated tools.
                                </p>
                            </div>

                            <div>
                                <span className="font-bold text-slate-800 block mb-1">4.13 Refund Handling</span>
                                <p>
                                    In the event of a client refund request, an investigation will be conducted by the company. The company will determine eligibility for a refund and the proportion, if any, of the agent's commission to be returned.
                                </p>
                            </div>

                            <div>
                                <span className="font-bold text-slate-800 block mb-1">4.14 Client Support on Demand</span>
                                <p>
                                    When a customer requires on-site support and the company directs an agent to attend, the agent must comply. Failure to do so will result in termination.
                                </p>
                            </div>

                            <div>
                                <span className="font-bold text-slate-800 block mb-1">4.15 Continuous Learning</span>
                                <p>
                                    Agents are obligated to continuously update their knowledge of Prokip to maintain and improve their competency in supporting clients.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 uppercase text-sm tracking-widest mb-3 border-b border-slate-100 pb-2">5. Work Expectations</h3>
                        <p>
                            Agents must follow the work schedules assigned to them, meet all deadlines, and uphold high-quality standards. Agents must commit to agreed working hours sufficient to honour client appointments for setup and support.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 uppercase text-sm tracking-widest mb-3 border-b border-slate-100 pb-2">6. Communication</h3>
                        <p>
                            Agents must be accessible online from Monday to Saturday. All correspondence from management or clients must be acknowledged and responded to as quickly as possible. All official interactions must take place on the communication channels provided by the company.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 uppercase text-sm tracking-widest mb-3 border-b border-slate-100 pb-2">7. Insurance and Liability</h3>
                        <p>
                            Agents are advised to operate from safe, secure locations and to maintain high personal safety standards. Prokip Limited shall only be liable for matters arising directly from officially assigned company duties carried out in accordance with company policies.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 uppercase text-sm tracking-widest mb-3 border-b border-slate-100 pb-2">8. Performance and Reward</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <span className="font-bold text-slate-800 block mb-1">8.1 Assessment</span>
                                <p>
                                    Agent performance will be closely monitored against company-wide Key Performance Indicators (KPIs).
                                </p>
                            </div>

                            <div>
                                <span className="font-bold text-slate-800 block mb-1">8.2 Review</span>
                                <p>
                                    Regular reviews will be conducted to correctly identify and reward high-performing agents. Rewards will be issued in accordance with the company Compensation Plan.
                                </p>
                            </div>

                            <div>
                                <span className="font-bold text-slate-800 block mb-1">8.3 Grievance</span>
                                <p>
                                    An agent who believes their performance assessment was unfairly or inaccurately conducted may request a third-party review by completing a Grievance Form and submitting it to their manager. Grievance Forms are available from management on request.
                                </p>
                            </div>

                            <div>
                                <span className="font-bold text-slate-800 block mb-1">8.4 Commission Policy Amendment</span>
                                <p className="mb-2">
                                    Prokip Limited reserves the right to review and amend the Commission & Payout Policy where necessary to reflect business realities, market conditions, or operational changes.
                                </p>
                                <p>
                                    Any changes will be communicated in writing and will not affect commissions already earned prior to the effective date of the change.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 uppercase text-sm tracking-widest mb-3 border-b border-slate-100 pb-2">9. Reporting</h3>
                        <p>
                            Prokip provides a 24/7 ethics hotline for agents to report complaints about inappropriate conduct by any party.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 uppercase text-sm tracking-widest mb-3 border-b border-slate-100 pb-2">10. Disciplinary and Legal Process</h3>
                        <p>
                            Prokip follows a three-step disciplinary process: verbal warning, written warning, and termination. This framework gives agents the opportunity to correct mistakes. However, Prokip Limited reserves the right to skip any step and proceed directly to termination or legal action where the nature of the violation warrants it.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 uppercase text-sm tracking-widest mb-3 border-b border-slate-100 pb-2">11. Confidentiality and Intellectual Property</h3>
                        <p className="mb-4">
                            All company materials, systems, pricing structures, Agents'App data, client information, training materials, documentation, processes, and proprietary methodologies remain the exclusive property of Prokip Limited.
                        </p>
                        <p className="mb-4">
                            Agents must not reproduce, distribute, exploit, or use company intellectual property for personal or competing business interests during or after their engagement with the company.
                        </p>
                        <p>
                            Confidentiality obligations survive termination.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 uppercase text-sm tracking-widest mb-3 border-b border-slate-100 pb-2">12. Incorporation of Other Policies</h3>
                        <p className="mb-2">
                            This Agent Agreement shall be read together with and incorporates the following policy documents contained in the Prokip Agent Policy Handbook:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-[#02275A] mb-4">
                            <li>Standard Operating Procedure (SOP)</li>
                            <li>Anti-Fraud Policy</li>
                            <li>Customer Data Protection Policy</li>
                            <li>Code of Conduct</li>
                            <li>Commission & Payout Policy</li>
                        </ul>
                        <p className="mb-4">
                            These documents form an integral and binding part of this Agreement.
                        </p>
                        <p>
                            Agents may also be required to sign additional declarations relating to Commission Plans, Confidentiality, or Compliance where issued by management.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 uppercase text-sm tracking-widest mb-3 border-b border-slate-100 pb-2">13. Governing Law</h3>
                        <p>
                            This Agreement shall be governed by and interpreted in accordance with the laws of the Federal Republic of Nigeria.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 uppercase text-sm tracking-widest mb-3 border-b border-slate-100 pb-2">14. Resignation</h3>
                        <p>
                            To resign, an agent must submit a written notice of a minimum of three (3) weeks to Prokip management. This period allows sufficient time for client support responsibilities to be formally transferred to another agent.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 uppercase text-sm tracking-widest mb-3 border-b border-slate-100 pb-2">15. Amendment</h3>
                        <p>
                            Prokip Limited reserves the right to update and revise this agreement and accompanying policies at any time. Agents will be notified of any material changes and may be required to re-acknowledge updated terms.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 uppercase text-sm tracking-widest mb-3 border-b border-slate-100 pb-2">16. Acknowledgement and Acceptance</h3>
                        <p>
                            By signing below, I confirm that I have read, understood, and agreed to abide by all the terms and conditions set out in this Agent Agreement and the incorporated policy documents. I commit to upholding the mission, values, and professional standards of Prokip Limited.
                        </p>
                    </div>
                </div>

                {/* Main Footer (Reading Phase) */}
                <div className="p-6 bg-slate-50 rounded-b-2xl shrink-0 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className={`transition-all duration-300 flex-1 ${hasRead ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <label className="flex items-start gap-3 cursor-pointer group hover:bg-white p-2 rounded-lg transition-colors">
                            <div className="relative flex items-center mt-1">
                                <input 
                                    type="checkbox" 
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="peer h-6 w-6 cursor-pointer appearance-none rounded border-2 border-slate-300 shadow-sm checked:border-[#02275A] checked:bg-[#02275A] focus:outline-none transition-all"
                                />
                                <i className="fas fa-check text-white absolute left-1 top-1 text-xs opacity-0 peer-checked:opacity-100 pointer-events-none"></i>
                            </div>
                            <span className="text-sm font-bold text-slate-700 pt-0.5 group-hover:text-slate-900 leading-tight">
                                I have read and agree to the Terms & Conditions.
                            </span>
                        </label>
                    </div>

                    <button 
                        onClick={handleProceedToSign}
                        disabled={!hasRead || !agreed}
                        className="w-full md:w-auto px-8 py-3 bg-[#02275A] text-white font-bold rounded-xl shadow-lg hover:bg-[#02275A]/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                        <span>Proceed to Sign</span>
                        <i className="fas fa-arrow-right"></i>
                    </button>
                </div>

                {/* SIGNATURE POPUP OVERLAY */}
                {showSignaturePad && (
                    <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 rounded-2xl animate-fade-in">
                        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
                            
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">Finalize Agreement</h3>
                                <button onClick={() => setShowSignaturePad(false)} className="text-slate-400 hover:text-slate-600">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            <form onSubmit={handleSign} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Legal Name</label>
                                    <input 
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Type your full name"
                                        className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A] bg-slate-50 focus:bg-white font-bold text-slate-800 transition-all"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Digital Signature</label>
                                        <button 
                                            type="button" 
                                            onClick={clearSignature}
                                            className="text-[10px] text-rose-600 font-bold hover:underline"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden h-[120px] cursor-crosshair touch-none hover:bg-white hover:border-[#02275A]/30 transition-colors">
                                        <canvas
                                            ref={canvasRef}
                                            className="w-full h-full"
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={stopDrawing}
                                            onMouseLeave={stopDrawing}
                                            onTouchStart={startDrawing}
                                            onTouchMove={draw}
                                            onTouchEnd={stopDrawing}
                                        />
                                        {!hasSigned && !isDrawing && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-sm font-bold uppercase tracking-widest opacity-50 select-none">
                                                Sign Here
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 text-center">Use your mouse or finger to sign in blue ink.</p>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={!fullName || !hasSigned || isSubmitting}
                                    className="w-full py-3.5 bg-[#02275A] text-white font-bold rounded-xl shadow-xl hover:bg-[#02275A]/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <><i className="fas fa-circle-notch fa-spin"></i> Activating...</>
                                    ) : (
                                        <><i className="fas fa-file-signature"></i> Sign & Activate Account</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentAgreementModal;
