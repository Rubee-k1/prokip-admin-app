
import React, { useState } from 'react';
import { KBModule, KBPath, QuizQuestion } from '../types';

export const MOCK_KB_MODULES: KBModule[] = [
    { 
        id: '401', 
        title: "Advanced Reporting Features", 
        type: "Video", 
        duration: "10:24", 
        description: "Learn how to use advanced reporting.",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        status: "Completed",
        quiz: [
            { id: 'q1', question: "What is the primary benefit of the Premium Plan?", options: ["Free Hardware", "Multi-location support", "Zero transaction fees", "None of the above"], correctIndex: 1 },
            { id: 'q2', question: "How long is the standard free trial?", options: ["7 Days", "14 Days", "30 Days", "Unlimited"], correctIndex: 1 }
        ]
    },
    { 
        id: '402', 
        title: "Customer Retention Strategies", 
        type: "Article", 
        duration: "5 min", 
        description: "Tips on keeping clients happy.",
        textContent: "Retaining customers is an art...",
        status: "Completed" 
    },
    { 
        id: '403', 
        title: "Prokip Mobile App Walkthrough", 
        type: "Video", 
        duration: "15:00", 
        description: "Full guide of the mobile app",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        status: "Completed",
        quiz: []
    },
    { 
        id: '406', 
        title: "Effective Cold Calling Scripts", 
        type: "Article", 
        duration: "7 min", 
        description: "Win over prospects via cold calling.",
        textContent: "Cold calling requires empathy...",
        status: "Completed" 
    }
];

const KnowledgeBaseView: React.FC<{ kbModules?: KBModule[] }> = ({ kbModules = MOCK_KB_MODULES }) => {
    const [activeTab, setActiveTab] = useState<'learning' | 'resources' | 'faq'>('learning');
    const [selectedModule, setSelectedModule] = useState<KBModule | null>(null);
    const [showQuiz, setShowQuiz] = useState(false);
    
    // Quiz State
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);

    // Mock Data
    const [learningPaths, setLearningPaths] = useState<KBPath[]>([
        {
            id: 1,
            title: "Agent Fundamentals",
            level: "Basic",
            progress: 100,
            isLocked: false,
            modules: [
                { id: '101', title: "Introduction to Prokip", description: '', type: "Video", duration: "5 min", status: "Completed", score: 100 },
                { id: '102', title: "Your First Sale", description: '', type: "Article", duration: "8 min", status: "Completed", score: 90 },
            ]
        },
        {
            id: 2,
            title: "Sales Mastery",
            level: "Intermediate",
            progress: 30,
            isLocked: false,
            modules: [
                { id: '201', title: "Handling Objections", description: '', type: "Video", duration: "12 min", status: "Completed", score: 85 },
                { id: '202', title: "Upselling Techniques", description: '', type: "Article", duration: "15 min", status: "InProgress" },
                { id: '203', title: "Closing Deals", description: '', type: "Video", duration: "10 min", status: "Locked" },
            ]
        },
        {
            id: 3,
            title: "Technical Support Pro",
            level: "Advanced",
            progress: 0,
            isLocked: true,
            modules: [
                { id: '301', title: "Hardware Setup", description: '', type: "Video", duration: "20 min", status: "Locked" },
                { id: '302', title: "Network Troubleshooting", description: '', type: "Article", duration: "15 min", status: "Locked" },
            ]
        }
    ]);

    const faqs = [
        { q: "How are commissions calculated?", a: "Commissions are calculated based on the net value of the subscription plan sold. You receive 15% on the first month and 5% on recurring renewals." },
        { q: "When do I get paid?", a: "Payouts are processed weekly. Any commission marked as 'Paid' in your Earnings tab is eligible for withdrawal immediately." },
        { q: "How do I register a new business?", a: "Go to the 'Businesses' tab and click 'Register New Business'. Fill in the owner's details and company information." },
        { q: "What if a payment fails?", a: "If a client's payment fails, their status will show as 'Pending'. Advise them to check their card balance or try a different payment method." }
    ];

    // Handlers
    const handleModuleClick = (module: KBModule) => {
        if (module.status === 'Locked') return;
        setSelectedModule(module);
        // Reset quiz state
        setShowQuiz(false);
        setQuizCompleted(false);
        setCurrentQuestion(0);
        setQuizScore(0);
    };

    const handleStartQuiz = () => {
        setShowQuiz(true);
    };

    const handleQuizAnswer = (optionIndex: number) => {
        const quizQuestions = selectedModule?.quiz || [];
        if (optionIndex === quizQuestions[currentQuestion]?.correctIndex) {
            setQuizScore(prev => prev + 1);
        }

        if (currentQuestion < quizQuestions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            setQuizCompleted(true);
        }
    };

    const handleCloseModal = () => {
        setSelectedModule(null);
        setShowQuiz(false);
    };

    return (
        <div className="w-full mx-auto px-4 md:px-8 py-6 animate-fade-in pb-20">
            {/* Certification Status Card */}
            <div className="bg-[#02275A] rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden mb-8 max-w-6xl mx-auto">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-white/10 rounded-full border-2 border-amber-400 flex items-center justify-center text-4xl shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                            <i className="fas fa-medal text-amber-400"></i>
                        </div>
                        <div>
                            <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Current Certification</p>
                            <h2 className="text-3xl font-bold">Silver Agent</h2>
                            <p className="text-sm text-indigo-100 mt-1">Level 2 Certified</p>
                        </div>
                    </div>
                    
                    <div className="w-full md:w-1/2">
                        <div className="flex justify-between text-xs font-bold mb-2 text-indigo-100">
                            <span>Progress to Gold</span>
                            <span>1,250 / 2,000 XP</span>
                        </div>
                        <div className="w-full bg-black/30 h-4 rounded-full overflow-hidden border border-white/10">
                            <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 w-[62%] relative">
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                        <p className="text-[10px] text-indigo-300 mt-2 text-right">Complete "Sales Mastery" to level up</p>
                    </div>
                </div>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none"></div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar max-w-6xl mx-auto">
                <button 
                    onClick={() => setActiveTab('learning')} 
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'learning' ? 'border-[#02275A] text-[#02275A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <i className="fas fa-road"></i> Learning Paths
                </button>
                <button 
                    onClick={() => setActiveTab('resources')} 
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'resources' ? 'border-[#02275A] text-[#02275A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <i className="fas fa-book-open"></i> Resource Library
                </button>
                <button 
                    onClick={() => setActiveTab('faq')} 
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'faq' ? 'border-[#02275A] text-[#02275A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <i className="fas fa-question-circle"></i> FAQs
                </button>
            </div>

            {/* Tab Content */}
            <div className="max-w-6xl mx-auto">
            {activeTab === 'learning' && (
                <div className="space-y-8">
                    {learningPaths.map((path) => (
                        <div key={path.id} className={`bg-white rounded-xl border ${path.isLocked ? 'border-slate-100 opacity-70' : 'border-slate-200'} shadow-sm overflow-hidden`}>
                            {/* Path Header */}
                            <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-slate-800">{path.title}</h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                            path.level === 'Basic' ? 'bg-emerald-100 text-emerald-700' : 
                                            path.level === 'Intermediate' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                        }`}>
                                            {path.level}
                                        </span>
                                        {path.isLocked && <i className="fas fa-lock text-slate-400"></i>}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span>{path.modules.length} Modules</span>
                                        <span>•</span>
                                        <span className="font-bold">{path.progress}% Completed</span>
                                    </div>
                                </div>
                            </div>

                            {/* Modules Grid */}
                            {!path.isLocked && (
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {path.modules.map((module) => (
                                        <div 
                                            key={module.id} 
                                            onClick={() => handleModuleClick(module)}
                                            className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                                                module.status === 'Locked' ? 'bg-slate-50 border-slate-100 cursor-not-allowed' : 
                                                'bg-white border-slate-200 hover:border-[#02275A] hover:shadow-md'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                                                    module.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 
                                                    module.status === 'Locked' ? 'bg-slate-200 text-slate-400' : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                    <i className={`fas ${module.type === 'Video' ? 'fa-play' : 'fa-file-alt'}`}></i>
                                                </div>
                                                {module.status === 'Completed' && <i className="fas fa-check-circle text-emerald-500"></i>}
                                                {module.status === 'Locked' && <i className="fas fa-lock text-slate-300"></i>}
                                            </div>
                                            
                                            <h4 className={`font-bold text-sm mb-1 ${module.status === 'Locked' ? 'text-slate-400' : 'text-slate-800'}`}>{module.title}</h4>
                                            <p className="text-xs text-slate-500 mb-3">{module.duration} • {module.type}</p>
                                            
                                            {module.status !== 'Locked' && (
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-[10px] font-bold text-[#02275A] group-hover:underline">
                                                        {module.status === 'Completed' ? 'Review' : 'Start Learning'}
                                                    </span>
                                                    {module.score && (
                                                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                                                            Score: {module.score}%
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'faq' && (
                <div className="space-y-4 max-w-3xl mx-auto">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                            <h3 className="font-bold text-slate-800 mb-2 flex items-start gap-3">
                                <span className="text-[#02275A] font-extrabold">Q.</span>
                                {faq.q}
                            </h3>
                            <div className="flex items-start gap-3 text-sm text-slate-600 pl-7 border-l-2 border-slate-100 ml-1">
                                <p>{faq.a}</p>
                            </div>
                        </div>
                    ))}
                    <div className="bg-[#02275A] p-8 rounded-xl shadow-lg text-center mt-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <i className="fas fa-headset text-9xl text-white"></i>
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4 backdrop-blur-sm">
                                <i className="fas fa-headset"></i>
                            </div>
                            <h3 className="font-bold text-white text-xl mb-2">Still have questions?</h3>
                            <p className="text-sm text-blue-100 mb-6 max-w-md mx-auto">Our support team is available 24/7 to assist you with any technical or account related issues.</p>
                            <button className="bg-white text-[#02275A] px-8 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-blue-50 transition-colors transform active:scale-95">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'resources' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kbModules.map((resource) => (
                        <div key={resource.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="h-40 bg-slate-200 relative">
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-4xl">
                                    <i className={`fas ${resource.type === 'Video' ? 'fa-play-circle' : 'fa-file-alt'}`}></i>
                                </div>
                                <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded">
                                    {resource.type} • {resource.duration}
                                </div>
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-slate-800 mb-2 group-hover:text-[#02275A] transition-colors">{resource.title}</h4>
                                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                                    {resource.type === 'Video' 
                                     ? 'Watch this comprehensive guide to master this topic.' 
                                     : 'Read this article to gain deeper insights and strategies.'}
                                </p>
                                <button 
                                    onClick={() => handleModuleClick(resource)}
                                    className="w-full py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    View Resource
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>

            {/* Module / Quiz Modal */}
            {selectedModule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
                        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <h3 className="font-bold text-slate-800">{selectedModule.title}</h3>
                                <p className="text-xs text-slate-500">{selectedModule.type} • {selectedModule.duration}</p>
                            </div>
                            <button onClick={handleCloseModal} className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-100">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="p-6">
                            {!showQuiz ? (
                                <div className="space-y-6">
                                    {/* Content Area */}
                                    <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center relative overflow-hidden group">
                                        {selectedModule.type === 'Video' ? (
                                            selectedModule.url?.includes('youtube') ? (
                                                <iframe 
                                                    className="w-full h-full"
                                                    src={selectedModule.url.includes('?') ? `${selectedModule.url}&controls=1` : `${selectedModule.url}?controls=1`}
                                                    title={selectedModule.title}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                ></iframe>
                                            ) : (
                                                <>
                                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer group-hover:scale-110 transition-transform">
                                                            <i className="fas fa-play text-3xl text-white pl-1"></i>
                                                        </div>
                                                    </div>
                                                </>
                                            )
                                        ) : selectedModule.type === 'Article' ? (
                                            <div className="absolute inset-0 bg-white p-8 text-left overflow-y-auto custom-scrollbar">
                                                <h2 className="text-2xl font-bold mb-4">{selectedModule.title}</h2>
                                                <div className="text-slate-600 whitespace-pre-wrap">
                                                    {selectedModule.textContent || "No article content available."}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                    
                                    {selectedModule.quiz && selectedModule.quiz.length > 0 && (
                                        <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                            <div>
                                                <p className="font-bold text-indigo-900 text-sm">Ready to test your knowledge?</p>
                                                <p className="text-xs text-indigo-600">Take a short quiz to complete this module and earn XP.</p>
                                            </div>
                                            <button onClick={handleStartQuiz} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-colors">
                                                Start Quiz
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* QUIZ MODE */
                                <div className="text-center max-w-lg mx-auto py-4">
                                    {!quizCompleted ? (
                                        <>
                                            <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
                                                <span>Question {currentQuestion + 1} of {selectedModule?.quiz?.length || 0}</span>
                                                <span>Score: {quizScore}</span>
                                            </div>
                                            
                                            <h3 className="text-xl font-bold text-slate-800 mb-8 leading-relaxed">
                                                {selectedModule?.quiz?.[currentQuestion]?.question}
                                            </h3>
                                            
                                            <div className="space-y-3">
                                                {selectedModule?.quiz?.[currentQuestion]?.options.map((option, idx) => (
                                                    <button 
                                                        key={idx}
                                                        onClick={() => handleQuizAnswer(idx)}
                                                        className="w-full p-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-[#02275A] hover:text-white hover:border-[#02275A] transition-all text-left shadow-sm"
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        /* QUIZ RESULT */
                                        <div className="py-8 animate-fade-in">
                                            <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center text-5xl mx-auto mb-6 shadow-sm">
                                                <i className="fas fa-trophy"></i>
                                            </div>
                                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Module Completed!</h2>
                                            <p className="text-slate-500 mb-6">You scored <span className="font-bold text-emerald-600">{quizScore} out of {selectedModule?.quiz?.length || 0}</span></p>

                                            
                                            <div className="flex justify-center gap-3">
                                                 <button onClick={() => { setQuizCompleted(false); setQuizScore(0); setCurrentQuestion(0); }} className="px-6 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">
                                                    Retry Quiz
                                                </button>
                                                <button onClick={handleCloseModal} className="px-6 py-2 bg-[#02275A] text-white rounded-xl font-bold shadow-md hover:bg-[#02275A]/90">
                                                    Finish Module
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KnowledgeBaseView;
