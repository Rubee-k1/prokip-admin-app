
import React, { useState } from 'react';
import { useAlert } from '../contexts/AlertContext';

interface Policy {
    id: number;
    title: string;
    date: string;
    content: React.ReactNode;
}

interface Violation {
    id: string;
    category: string;
    type: string;
    date: string;
    severity: 'High' | 'Medium' | 'Low';
    status: 'Active' | 'Resolved' | 'Under Review';
    description: string;
    strikeNumber?: number;
}

const PolicyView: React.FC = () => {
    const { showSuccess, showInfo } = useAlert();
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
    
    const [violations, setViolations] = useState<Violation[]>([
        {
            id: 'VIO-2023-002',
            category: 'Meeting & Attendance Violations',
            type: 'Missing scheduled meetings without prior approved excuse',
            date: 'Oct 15, 2023',
            severity: 'Low',
            status: 'Active',
            description: 'Absent from weekly state meeting without prior notification.',
            strikeNumber: 1
        },
        {
            id: 'VIO-2023-003',
            category: 'Sales & Pricing Violations',
            type: 'Selling above official company pricing',
            date: 'Oct 20, 2023',
            severity: 'Medium',
            status: 'Active',
            description: 'Client reported being charged ₦5,000 extra for standard plan.',
            strikeNumber: 2
        }
    ]);

    const pndViolation = violations.find(v => v.category === 'Payment & Financial Violations');
    const isRestricted = !!pndViolation;
    const activeStrikes = violations.filter(v => v.category !== 'Payment & Financial Violations' && v.status === 'Active').length;
    
    // Modal States
    const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
    const [appealModalOpen, setAppealModalOpen] = useState(false);
    const [agreementModalOpen, setAgreementModalOpen] = useState(false);
    const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
    const [appealText, setAppealText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const policies: Policy[] = [
        { 
            id: 1, 
            title: 'Code of Conduct', 
            date: 'Last updated: Jan 2023',
            content: (
                <div className="space-y-6 text-slate-600">
                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">Professional Standards</h4>
                        <p className="mb-2">Agents represent Prokip Limited and must:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Act with integrity and professionalism.</li>
                            <li>Treat clients, colleagues, and management with respect.</li>
                            <li>Avoid behavior that may damage company reputation.</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">Communication Expectations</h4>
                        <p className="mb-2">Agents must:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Actively monitor and participate in official company communication channels.</li>
                            <li>Respond to official directives within reasonable timeframes.</li>
                            <li>Maintain respectful tone in all written and verbal communications.</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">Representation</h4>
                        <p className="mb-2">Agents must not:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Make public statements on behalf of Prokip Limited without authorization.</li>
                            <li>Publish misleading marketing materials.</li>
                            <li>Misrepresent company capabilities or commitments.</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">Emotional & Behavioral Conduct</h4>
                        <p className="mb-2">Agents must maintain professional emotional control in client and team interactions.</p>
                        <p>Violations may result in suspension or other disciplinary actions in accordance with the Agent Agreement.</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">Governance</h4>
                        <p>This Code of Conduct forms part of the Prokip Limited Agent Framework and is legally binding under the Agent Agreement.</p>
                    </div>
                </div>
            )
        },
        { 
            id: 2, 
            title: 'Standard Operating Procedures', 
            date: 'Last updated: Feb 2023',
            content: (
                <div className="space-y-6 text-slate-600">
                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">Binding Status</h4>
                        <p>This Standard Operating Procedure (SOP) forms an integral part of the Prokip Limited Agent Framework and is legally binding on all Business Relationship Managers (BRMs). It shall be read together with the Agent Agreement and all related policies.</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">1. Onboarding Process</h4>
                        <p className="mb-2">Agents must:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-2">
                            <li>Present only officially approved pricing and packages.</li>
                            <li>Use the official onboarding process and tools provided by Prokip Limited.</li>
                            <li>Submit complete and accurate Business Owner (BO) information.</li>
                            <li>Ensure payments are made directly through approved company channels.</li>
                        </ul>
                        <p>No Agent is permitted to alter pricing, offer unofficial discounts, or create alternative payment arrangements without written authorization from Prokip Limited.</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">2. Relationship Management</h4>
                        <p className="mb-2">Agents are responsible for:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-2">
                            <li>Maintaining professional and regular communication with BOs.</li>
                            <li>Ensuring successful system setup and onboarding completion.</li>
                            <li>Escalating technical or operational issues through official support channels.</li>
                            <li>Protecting the reputation and brand integrity of Prokip Limited at all times.</li>
                        </ul>
                        <p>Agents shall not misrepresent features, make unauthorized commitments, or promise future functionality not formally approved.</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">3. Remote Access Policy</h4>
                        <p className="mb-2">Where remote support is required:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Access must be initiated with the knowledge and express consent of the Business Owner.</li>
                            <li>Agents must not retain client passwords or store login credentials.</li>
                            <li>Permanent or unattended remote access must not be enabled without written approval from both the client and Prokip Limited.</li>
                            <li>Remote tools must be used strictly for authorized support purposes.</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">4. Authority Limitation</h4>
                        <p className="mb-2">Agents may not:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-2">
                            <li>Modify system functionality.</li>
                            <li>Adjust subscription structures.</li>
                            <li>Bind Prokip Limited to contractual obligations.</li>
                            <li>Issue written or verbal guarantees outside approved company materials.</li>
                        </ul>
                        <p>All commitments must align strictly with official company communication.</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">5. Governance</h4>
                        <p>This SOP shall be governed by and interpreted in accordance with the Prokip Limited Agent Agreement and applicable Nigerian laws.</p>
                    </div>
                </div>
            )
        },
        { 
            id: 3, 
            title: 'Commission & Payout Policy', 
            date: 'Last updated: Mar 2023',
            content: (
                <div className="space-y-4 text-slate-600">
                    <div>
                        <h4 className="font-bold text-slate-800 mb-1">1. Commission Structure</h4>
                        <p>Commissions are calculated as a percentage of the net subscription value paid by the client. Standard rates are 10% for new sales and 5% for renewals.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 mb-1">2. Payout Schedule</h4>
                        <p>Earnings are available for withdrawal immediately after the client's payment is confirmed. Withdrawal requests are processed within 24 hours on business days.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 mb-1">3. Refund Clawbacks</h4>
                        <p>If a client requests and receives a refund within 30 days of purchase, the commission paid to the agent for that sale will be deducted from the agent's future earnings.</p>
                    </div>
                </div>
            )
        },
        { 
            id: 4, 
            title: 'Anti-Fraud Policy', 
            date: 'Last updated: Dec 2022',
            content: (
                <div className="space-y-6 text-slate-600">
                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">Purpose</h4>
                        <p>This policy is established to protect Prokip Limited, its Agents, and Business Owners from financial misconduct, misrepresentation, and unethical practices.</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">Prohibited Conduct</h4>
                        <p className="mb-2">The following actions are strictly prohibited:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Diversion or withholding of client payments.</li>
                            <li>False onboarding or fake client registrations.</li>
                            <li>Manipulation of commission records.</li>
                            <li>Unauthorized collection of funds.</li>
                            <li>Misrepresentation of pricing, features, or company authority.</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">Investigation Process</h4>
                        <p className="mb-2">All allegations of fraud or misconduct shall be subject to internal investigation.</p>
                        <p>Prokip Limited reserves the right to suspend system access pending investigation where financial or reputational risk exists.</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">Disciplinary Measures</h4>
                        <p className="mb-2">Depending on severity, disciplinary actions may include:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-2">
                            <li>Formal warning</li>
                            <li>Temporary suspension</li>
                            <li>Termination</li>
                            <li>Immediate commission forfeiture</li>
                        </ul>
                        <p>Agents dismissed for financial misconduct automatically forfeit any unpaid commissions at the time of dismissal.</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">Reporting</h4>
                        <p className="mb-2">Any suspected fraud must be reported immediately to management through official communication channels.</p>
                        <p>Failure to report known misconduct may itself constitute a violation.</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">Governance</h4>
                        <p>This Anti-Fraud Policy forms part of the Prokip Limited Agent Framework and is enforceable under the Agent Agreement.</p>
                    </div>
                </div>
            )
        },
        { 
            id: 5, 
            title: 'Data Protection Policy', 
            date: 'Last updated: Jun 2023',
            content: (
                <div className="space-y-6 text-slate-600">
                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">Purpose</h4>
                        <p>This policy ensures lawful, secure, and responsible handling of company and client data.</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">Legal Framework</h4>
                        <p>This policy shall be interpreted in accordance with the Nigeria Data Protection Act (NDPA 2023) and any applicable regulations.</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">Data Handling Standards</h4>
                        <p className="mb-2">Agents must:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-2">
                            <li>Access client data only for authorized business purposes.</li>
                            <li>Maintain strict confidentiality of all information.</li>
                            <li>Use password-protected devices when storing company or client data.</li>
                            <li>Avoid sharing information via unauthorized third-party platforms.</li>
                            <li>Prevent unauthorized access to sensitive information.</li>
                        </ul>
                        <p>Where data is stored on personal devices, it must be secured and protected from unauthorized use.</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">Confidentiality Obligation</h4>
                        <p className="mb-2">Client information, business data, pricing models, and internal materials must not be disclosed without written authorization.</p>
                        <p>This obligation survives termination of the Agent relationship.</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">Breach Consequences</h4>
                        <p className="mb-2">Violation of this policy may result in:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Immediate suspension</li>
                            <li>Termination</li>
                            <li>Legal action</li>
                            <li>Commission forfeiture where applicable</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">Governance</h4>
                        <p>This Data Protection Policy forms part of the Prokip Limited Agent Framework and shall be read together with the Agent Agreement and other related policies.</p>
                    </div>
                </div>
            )
        },
    ];

    const togglePND = () => {
        if (isRestricted) {
            setViolations(violations.filter(v => v.category !== 'Payment & Financial Violations'));
        } else {
            const newViolation: Violation = {
                id: `VIO-${Date.now()}`,
                category: 'Payment & Financial Violations',
                type: 'Receiving client payments into personal accounts',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                severity: 'High',
                status: 'Active',
                description: 'Unauthorized collection of funds detected. Account placed on PND.',
            };
            setViolations([newViolation, ...violations]);
        }
    };

    const violationCategories = [
        {
            category: "Meeting & Attendance Violations",
            items: [
                "Missing scheduled meetings without prior approved excuse",
                "Missing compulsory company meetings",
                "Late attendance to official meetings",
                "Failure to attend daily or weekly meetings",
                "Failure to attend assigned client appointments",
                "Failure to attend company-directed on-site support"
            ]
        },
        {
            category: "Communication Violations",
            items: [
                "Ignoring management messages beyond 2 hours",
                "Ignoring client messages",
                "Failure to acknowledge official communication",
                "Disrespectful or unprofessional communication",
                "Emotional outbursts during client or team interaction",
                "Failure to be accessible Monday–Saturday",
                "Conducting official communication outside approved channels"
            ]
        },
        {
            category: "Sales & Pricing Violations",
            items: [
                "Selling above official company pricing",
                "Unauthorized discounting",
                "Overcharging clients",
                "Charging for non-approved services",
                "Charging separately for training or complete setup",
                "Making unauthorized promises to clients",
                "Misrepresenting pricing, features, or authority"
            ]
        },
        {
            category: "Payment & Financial Violations",
            items: [
                "Receiving client payments into personal accounts",
                "Directing payments to another agent’s personal account",
                "Diversion or withholding of client funds",
                "Unauthorized collection of money",
                "False onboarding or fake registrations",
                "Manipulating commission records",
                "Refusal to return commission after refund decision"
            ]
        },
        {
            category: "Lead Management Violations",
            items: [
                "Converting company leads to personal leads",
                "Closing deals outside the official system",
                "Exploiting company leads for personal benefit",
                "Hoarding or failing to follow up on assigned leads"
            ]
        },
        {
            category: "System & Reporting Violations",
            items: [
                "Entering false data in Agents’App",
                "Fabricating meetings or lead interactions",
                "Falsifying invoices",
                "Misreporting performance data",
                "Refusal to use official tools",
                "Tampering with company systems"
            ]
        },
        {
            category: "Service Delivery Violations",
            items: [
                "Failing to commence setup within 1–7 days without valid reason",
                "Failure to inform clients of delays",
                "Poor or incomplete setup",
                "Incompetent client support",
                "Failure to meet deadlines",
                "Delivering substandard service"
            ]
        },
        {
            category: "Confidentiality & Data Violations",
            items: [
                "Sharing client information without authorization",
                "Unauthorized access to company or client data",
                "Storing data on unsecured devices",
                "Sharing company materials externally",
                "Using company intellectual property for personal or competing business",
                "Post-termination misuse of confidential information"
            ]
        },
        {
            category: "Integrity & Reputation Violations",
            items: [
                "Making unauthorized public statements",
                "Publishing misleading marketing materials",
                "Damaging company reputation",
                "Failing to honor company commitments",
                "Misrepresentation of company capabilities"
            ]
        },
        {
            category: "Compliance & Governance Violations",
            items: [
                "Failure to comply with incorporated policies",
                "Refusal to sign required declarations",
                "Failure to report known misconduct",
                "Failure to cooperate during investigation",
                "Abandoning duties without notice",
                "Failure to give required resignation notice"
            ]
        }
    ];

    const handleViewEvidence = (violation: Violation) => {
        setSelectedViolation(violation);
        setEvidenceModalOpen(true);
    };

    const handleOpenAppeal = (violation: Violation) => {
        setSelectedViolation(violation);
        setAppealText('');
        setAppealModalOpen(true);
    };

    const handleSubmitAppeal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!appealText.trim()) return;

        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setAppealModalOpen(false);
            showSuccess(`Appeal submitted for Violation #${selectedViolation?.id}. Case ID: CS-${Math.floor(Math.random() * 1000)}`);
        }, 1500);
    };

    return (
        <div className="w-full mx-auto px-4 md:px-8 py-6 animate-fade-in max-w-6xl">
            
            {/* Simulation Toggle (Dev Tool) */}
            <div className="flex justify-end mb-6">
                <button 
                    onClick={togglePND}
                    className={`text-xs font-bold px-4 py-2 rounded-lg border transition-colors shadow-sm flex items-center gap-2 ${
                        isRestricted 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' 
                        : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                    }`}
                >
                    <i className={`fas ${isRestricted ? 'fa-undo' : 'fa-ban'}`}></i>
                    {isRestricted ? 'Restore Good Standing' : 'Simulate PND Violation'}
                </button>
            </div>

            {/* PND Banner */}
            {isRestricted && (
                <div className="bg-rose-600 text-white rounded-xl p-6 shadow-lg mb-8 flex flex-col md:flex-row items-start gap-4 border-l-8 border-rose-800 animate-fade-in">
                    <div className="bg-white/20 p-3 rounded-full shrink-0">
                        <i className="fas fa-lock text-2xl"></i>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-xl mb-1">Account Restricted (PND)</h3>
                        <p className="text-rose-100 text-sm leading-relaxed opacity-90">
                            Your account has been placed on <strong>Post No Debit</strong> status due to a severe policy violation. 
                            While under investigation, you cannot withdraw commissions or onboard new businesses.
                        </p>
                    </div>
                    <button className="bg-white text-rose-700 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-rose-50 transition-colors shadow-sm whitespace-nowrap self-start md:self-center">
                        Contact Compliance
                    </button>
                </div>
            )}

            {/* Status Card */}
            <div className={`rounded-xl border shadow-sm p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 ${
                isRestricted 
                ? 'bg-white border-rose-200 ring-4 ring-rose-50' 
                : activeStrikes > 0 
                    ? 'bg-white border-amber-200 ring-4 ring-amber-50'
                    : 'bg-white border-slate-100'
            }`}>
                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-sm ${
                        isRestricted 
                        ? 'bg-rose-100 text-rose-600' 
                        : activeStrikes > 0
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-emerald-50 text-emerald-600'
                    }`}>
                        <i className={`fas ${isRestricted ? 'fa-ban' : activeStrikes > 0 ? 'fa-exclamation-triangle' : 'fa-shield-check'}`}></i>
                    </div>
                    <div>
                        <h2 className={`text-xl font-bold ${isRestricted ? 'text-rose-700' : activeStrikes > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
                            {isRestricted ? 'Account Restricted (PND)' : activeStrikes > 0 ? 'Warning: Active Strikes' : 'Account Standing: Good'}
                        </h2>
                        <p className={`text-sm ${isRestricted ? 'text-rose-600 font-medium' : activeStrikes > 0 ? 'text-amber-600 font-medium' : 'text-slate-500'}`}>
                            {isRestricted 
                                ? 'Your account is under PND due to financial violations.' 
                                : activeStrikes > 0 
                                    ? `You have ${activeStrikes} active strike${activeStrikes > 1 ? 's' : ''}. 3 strikes will lead to review.`
                                    : 'You are compliant with all Prokip agent policies.'}
                        </p>
                    </div>
                </div>
                {!isRestricted && (
                    <button 
                        onClick={() => setAgreementModalOpen(true)}
                        className="px-5 py-2.5 bg-slate-50 text-slate-600 font-bold rounded-lg text-sm hover:bg-slate-100 transition-colors border border-slate-200 flex items-center gap-2"
                    >
                        <i className="fas fa-file-contract"></i> View Signed Agreement
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Violations Section */}
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <i className={`fas ${isRestricted ? 'fa-file-contract text-rose-500' : 'fa-check-circle text-slate-400'}`}></i> 
                        Violation History
                    </h3>
                    
                    {violations.length > 0 ? (
                        <div className="space-y-4 animate-fade-in">
                            {violations.map((violation) => {
                                const isPND = violation.category === 'Payment & Financial Violations';
                                return (
                                    <div key={violation.id} className={`bg-white rounded-xl border shadow-sm p-5 border-l-4 relative overflow-hidden ${
                                        isPND ? 'border-rose-100 border-l-rose-500' : 'border-amber-100 border-l-amber-500'
                                    }`}>
                                        <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
                                            <i className={`fas ${isPND ? 'fa-ban' : 'fa-exclamation-triangle'} text-6xl ${isPND ? 'text-rose-500' : 'text-amber-500'}`}></i>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                                        violation.severity === 'High' ? 'bg-rose-100 text-rose-700' : 
                                                        violation.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>{violation.severity}</span>
                                                    <span className="text-xs text-slate-400">{violation.date}</span>
                                                </div>
                                                {isPND ? (
                                                    <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <i className="fas fa-lock"></i> PND Active
                                                    </span>
                                                ) : (
                                                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <i className="fas fa-times-circle"></i> Strike {violation.strikeNumber}/3
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{violation.category}</p>
                                            <h4 className="text-slate-800 font-bold text-sm mb-1">{violation.type}</h4>
                                            <p className="text-xs text-slate-600 leading-relaxed mb-4">{violation.description}</p>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleViewEvidence(violation)}
                                                    className={`flex-1 py-2 text-xs font-bold rounded border transition-colors ${
                                                        isPND 
                                                        ? 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100' 
                                                        : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100'
                                                    }`}
                                                >
                                                    View Evidence
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenAppeal(violation)}
                                                    className="flex-1 py-2 bg-white text-slate-600 text-xs font-bold rounded border border-slate-200 hover:bg-slate-50 transition-colors"
                                                >
                                                    Submit Appeal
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-64 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 text-2xl mb-4">
                                <i className="fas fa-check"></i>
                            </div>
                            <p className="text-slate-600 font-bold">No violations recorded</p>
                            <p className="text-xs text-slate-400 mt-1 max-w-xs">Your account is in good standing. Keep following the agent guidelines to maintain your status.</p>
                        </div>
                    )}
                </div>

                {/* Policies List */}
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <i className="fas fa-book text-[#02275A]"></i> Agent Policies
                    </h3>
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-50">
                        {policies.map((policy) => (
                            <div 
                                key={policy.id} 
                                onClick={() => setSelectedPolicy(policy)}
                                className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer group"
                            >
                                <div>
                                    <h4 className="font-bold text-slate-700 text-sm group-hover:text-[#02275A] transition-colors">{policy.title}</h4>
                                    <p className="text-[10px] text-slate-400">{policy.date}</p>
                                </div>
                                <i className="fas fa-chevron-right text-slate-300 text-xs group-hover:text-[#02275A] transition-colors"></i>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Policy Violations List */}
            <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-exclamation-circle text-rose-500"></i> 
                    Categorized Policy Violations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {violationCategories.map((category, index) => (
                        <div key={index} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                            <h4 className="font-bold text-slate-800 mb-3 border-b border-slate-50 pb-2 text-sm uppercase tracking-wide">
                                {category.category}
                            </h4>
                            <ul className="space-y-2">
                                {category.items.map((item, idx) => (
                                    <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-1.5 shrink-0"></span>
                                        <span className="leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Policy Detail Modal */}
            {selectedPolicy && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl relative flex flex-col">
                        <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{selectedPolicy.title}</h3>
                                <p className="text-xs text-slate-500">{selectedPolicy.date}</p>
                            </div>
                            <button onClick={() => setSelectedPolicy(null)} className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto bg-slate-50/30">
                            <div className="prose prose-sm max-w-none">
                                {selectedPolicy.content}
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
                            <button onClick={() => setSelectedPolicy(null)} className="px-6 py-2.5 bg-[#02275A] text-white rounded-xl font-bold text-sm hover:bg-[#02275A]/90 transition-colors shadow-sm">
                                Close Document
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Signed Agreement Modal */}
            {agreementModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col">
                        <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <i className="fas fa-file-contract"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">Signed Service Agreement</h3>
                                    <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                        <i className="fas fa-check-circle"></i> Active & Binding
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setAgreementModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div className="p-8 overflow-y-auto custom-scrollbar bg-white">
                            <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
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

                            {/* Signature Section */}
                            <div className="mt-10 p-6 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Signed By</p>
                                        <p className="text-xl font-bold text-slate-800">John Agent</p>
                                        <p className="text-xs text-slate-500 mt-1">Date Signed: 15 Jan 2023</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">IP: 197.210.45.12</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Digital Signature</p>
                                        <div className="h-16 flex items-end justify-end">
                                            {/* Stylized Signature Representation */}
                                            <div className="font-script text-4xl text-[#0000CC] transform -rotate-2 select-none" style={{ fontFamily: 'cursive' }}>
                                                John Agent
                                            </div>
                                        </div>
                                        <div className="w-48 h-px bg-slate-300 mt-1"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center">
                            <span className="text-xs text-slate-400">Document ID: AGT-2023-8821</span>
                            <button onClick={() => { showSuccess("Agreement downloaded as PDF"); setAgreementModalOpen(false); }} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
                                <i className="fas fa-download"></i> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Evidence Modal */}
            {evidenceModalOpen && selectedViolation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-lg">Violation Evidence</h3>
                            <button onClick={() => setEvidenceModalOpen(false)} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
                        </div>
                        <div className="p-6 bg-slate-50/50 overflow-y-auto">
                            <div className="mb-4 bg-white p-4 rounded-xl border border-slate-200">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Violation ID</p>
                                <p className="text-sm font-bold text-slate-800 mb-3">{selectedViolation.id}</p>
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Description</p>
                                <p className="text-sm text-slate-600 leading-relaxed">{selectedViolation.description}</p>
                            </div>

                            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <i className="fas fa-file-invoice text-slate-400"></i> System Logs & Proof
                            </h4>
                            <div className="space-y-3">
                                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-600">
                                    <span className="text-rose-500 block mb-1">[CRITICAL] 2023-10-26 14:22:10</span>
                                    Duplicate KYC Identity Hash Detected.
                                    <br /> Source IP: 192.168.1.45 matches User ID #9921 (Suspended)
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-50 text-red-500 rounded flex items-center justify-center">
                                        <i className="fas fa-image"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">forged_document_scan.jpg</p>
                                        <p className="text-[10px] text-slate-400">Detected digitally altered pixels</p>
                                    </div>
                                    <button className="ml-auto text-xs text-[#02275A] font-bold hover:underline">View</button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-white text-right">
                            <button onClick={() => setEvidenceModalOpen(false)} className="px-5 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg text-sm hover:bg-slate-200 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Appeal Modal */}
            {appealModalOpen && selectedViolation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
                        <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-lg">Submit Appeal</h3>
                            <button onClick={() => setAppealModalOpen(false)} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
                        </div>
                        
                        <form onSubmit={handleSubmitAppeal}>
                            <div className="p-6">
                                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg mb-4 flex gap-2 items-start">
                                    <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                                    <p className="text-xs text-blue-800 leading-relaxed">
                                        You are appealing violation <strong>{selectedViolation.id}</strong>. Please provide a detailed explanation and attach any supporting documents to prove your compliance.
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Statement of Defense</label>
                                    <textarea 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A] min-h-[120px] resize-none"
                                        placeholder="Explain why this violation is incorrect..."
                                        value={appealText}
                                        onChange={(e) => setAppealText(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                
                                <div className="flex justify-end gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setAppealModalOpen(false)}
                                        className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="px-5 py-2.5 bg-[#02275A] text-white font-bold rounded-xl text-sm hover:bg-[#02275A]/90 transition-colors shadow-md disabled:opacity-70"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Appeal'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PolicyView;
