import React, { useState } from 'react';
import { ChartOfAccount, FinanceExpense, FinanceAllowedBudget } from '../types';
import AdminPayrollView from './AdminPayrollView';

const MOCK_ACCOUNTS: ChartOfAccount[] = [
    { id: 'acc-001', code: '1000', name: 'Main Operating Account', type: 'Asset', balance: 45000000, description: 'Bank Account' },
    { id: 'acc-002', code: '4000', name: 'Software Subscriptions', type: 'Revenue', balance: 8000000, description: 'SaaS Revenue' },
    { id: 'acc-003', code: '5000', name: 'Marketing & Advertising', type: 'Expense', balance: 2500000, description: 'Ads and Promotions' },
    { id: 'acc-004', code: '5010', name: 'Payroll', type: 'Expense', balance: 12000000, description: 'Staff Salaries' },
];

const MOCK_EXPENSES: FinanceExpense[] = [
    { id: 'exp-001', date: '2023-11-01', amount: 500000, description: 'Facebook Ads - Nov', category: 'Marketing', accountId: 'acc-003', recurring: true, frequency: 'Monthly', status: 'Approved', submittedBy: 'Accountant Mary', marketingRelated: true },
    { id: 'exp-002', date: '2023-11-15', amount: 150000, description: 'Office Supplies', category: 'Operations', accountId: 'acc-001', recurring: false, status: 'Pending', submittedBy: 'Accountant Mary', marketingRelated: false },
];

const MOCK_BUDGETS: FinanceAllowedBudget[] = [
    { id: 'bud-001', category: 'Marketing', monthlyLimit: 2000000, spentThisMonth: 500000 },
    { id: 'bud-002', category: 'Operations', monthlyLimit: 500000, spentThisMonth: 150000 },
];

interface AdminFinanceCenterProps {
    expenses: FinanceExpense[];
    setExpenses: React.Dispatch<React.SetStateAction<FinanceExpense[]>>;
}

const AdminFinanceCenterView: React.FC<AdminFinanceCenterProps> = ({ expenses, setExpenses }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'expenses' | 'budgets' | 'payroll'>('dashboard');
    const [accounts, setAccounts] = useState<ChartOfAccount[]>(MOCK_ACCOUNTS);
    const [budgets, setBudgets] = useState<FinanceAllowedBudget[]>(MOCK_BUDGETS);

    const [showExpenseModal, setShowExpenseModal] = useState(false);
    
    // New states for extended features
    const [expenseSearch, setExpenseSearch] = useState('');
    const [expenseFilterStatus, setExpenseFilterStatus] = useState('All');
    const [expenseFilterCategory, setExpenseFilterCategory] = useState('All');
    
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<FinanceAllowedBudget | null>(null);

    const [newExpense, setNewExpense] = useState<Partial<FinanceExpense>>({
        date: new Date().toISOString().split('T')[0],
        category: 'Marketing',
        accountId: accounts[0]?.id,
        recurring: false,
        marketingRelated: false,
        status: 'Pending'
    });

    const [newAccount, setNewAccount] = useState<Partial<ChartOfAccount>>({
        code: '', name: '', type: 'Expense', balance: 0, description: ''
    });

    const categories = ['Marketing', 'Operations', 'Payroll', 'Software', 'Travel', 'Office Supplies', 'Legal'];

    const handleAddExpense = (e: React.FormEvent) => {
        e.preventDefault();
        const expense: FinanceExpense = {
            id: `exp-${Date.now()}`,
            date: newExpense.date || '',
            amount: Number(newExpense.amount),
            description: newExpense.description || '',
            category: newExpense.category || '',
            accountId: newExpense.accountId || '',
            recurring: newExpense.recurring || false,
            frequency: newExpense.frequency,
            status: newExpense.status as any || 'Pending',
            submittedBy: 'Admin (CEO)',
            marketingRelated: newExpense.marketingRelated
        };
        
        setExpenses([expense, ...expenses]);
        setShowExpenseModal(false);
    };

    const handleApprove = (id: string) => {
        setExpenses(expenses.map(e => e.id === id ? { ...e, status: 'Approved', approvedBy: 'Admin (CEO)' } : e));
    };

    const handleReject = (id: string) => {
        setExpenses(expenses.map(e => e.id === id ? { ...e, status: 'Rejected', approvedBy: 'Admin (CEO)' } : e));
    };

    const handleDeleteExpense = (id: string) => {
        if(window.confirm('Are you sure you want to delete this expense?')) {
            setExpenses(expenses.filter(e => e.id !== id));
        }
    };

    const handleAddAccount = (e: React.FormEvent) => {
        e.preventDefault();
        const account: ChartOfAccount = {
            id: `acc-${Date.now()}`,
            code: newAccount.code || '',
            name: newAccount.name || '',
            type: newAccount.type as any || 'Expense',
            balance: Number(newAccount.balance) || 0,
            description: newAccount.description || ''
        };
        setAccounts([...accounts, account]);
        setShowAccountModal(false);
        setNewAccount({ code: '', name: '', type: 'Expense', balance: 0, description: '' });
    };

    const handleUpdateBudget = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedBudget) {
            setBudgets(budgets.map(b => b.id === selectedBudget.id ? selectedBudget : b));
            setShowBudgetModal(false);
            setSelectedBudget(null);
        }
    };

    const filteredExpenses = expenses.filter(e => {
        const matchSearch = e.description.toLowerCase().includes(expenseSearch.toLowerCase()) || e.submittedBy.toLowerCase().includes(expenseSearch.toLowerCase());
        const matchStatus = expenseFilterStatus === 'All' || e.status === expenseFilterStatus;
        const matchCat = expenseFilterCategory === 'All' || e.category === expenseFilterCategory;
        return matchSearch && matchStatus && matchCat;
    });

    // Calculations for Dashboard
    const totalRevenue = accounts.filter(a => a.type === 'Revenue').reduce((sum, a) => sum + a.balance, 0);
    const totalApprovedExpenses = expenses.filter(e => e.status === 'Approved').reduce((sum, e) => sum + e.amount, 0);
    const netIncome = totalRevenue - totalApprovedExpenses;

    // Expenses by Category
    const categoryTotals = categories.map(cat => ({
        category: cat,
        total: expenses.filter(e => e.status === 'Approved' && e.category === cat).reduce((sum, e) => sum + e.amount, 0)
    })).filter(c => c.total > 0).sort((a,b) => b.total - a.total);

    return (
        <div className="p-6 animate-fade-in space-y-6 pb-20">
            {/* Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex gap-2 overflow-x-auto">
                <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-[#02275A] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <i className="fas fa-chart-pie mr-2"></i> Financial Reports
                </button>
                <button onClick={() => setActiveTab('expenses')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'expenses' ? 'bg-[#02275A] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <i className="fas fa-receipt mr-2"></i> Expenses & Approvals
                </button>
                <button onClick={() => setActiveTab('accounts')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'accounts' ? 'bg-[#02275A] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <i className="fas fa-book mr-2"></i> Chart of Accounts
                </button>
                <button onClick={() => setActiveTab('budgets')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'budgets' ? 'bg-[#02275A] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <i className="fas fa-money-check-alt mr-2"></i> Monthly Budgets
                </button>
                <button onClick={() => setActiveTab('payroll')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'payroll' ? 'bg-[#02275A] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <i className="fas fa-users-cog mr-2"></i> Payroll
                </button>
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500"><i className="fas fa-arrow-up text-4xl"></i></div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Revenue</h3>
                            <p className="text-3xl font-black text-slate-800">₦{totalRevenue.toLocaleString()}</p>
                            <p className="text-sm font-bold text-emerald-600 mt-2"><i className="fas fa-trend-up"></i> +12% this month</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-rose-500"><i className="fas fa-arrow-down text-4xl"></i></div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Expenses</h3>
                            <p className="text-3xl font-black text-slate-800">₦{totalApprovedExpenses.toLocaleString()}</p>
                            <p className="text-sm font-bold text-amber-600 mt-2"><i className="fas fa-exclamation-circle"></i> Needs Review: {expenses.filter(e => e.status === 'Pending').length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-blue-500"><i className="fas fa-bullseye text-4xl"></i></div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Net Income</h3>
                            <p className="text-3xl font-black text-[#02275A]">₦{netIncome.toLocaleString()}</p>
                            <p className="text-sm font-bold text-blue-600 mt-2">Healthy Runway</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-black text-[#02275A] mb-4">Profit and Loss Summary</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-slate-600 font-bold">Income</span>
                                    <span className="font-black text-slate-800 tracking-tight">₦{totalRevenue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100 pl-4">
                                    <span className="text-slate-500">Less: Cost of Goods Sold</span>
                                    <span className="font-bold text-rose-600 tracking-tight">- ₦0</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100 bg-slate-50 p-2 rounded">
                                    <span className="text-slate-700 font-black">Gross Profit</span>
                                    <span className="font-black text-slate-800 tracking-tight">₦{totalRevenue.toLocaleString()}</span>
                                </div>
                                
                                <div className="pt-2">
                                    <span className="text-slate-600 font-bold mb-2 block">Operating Expenses</span>
                                    {categoryTotals.map(cat => (
                                        <div key={cat.category} className="flex justify-between items-center py-1.5 pl-4 text-sm border-b border-slate-50">
                                            <span className="text-slate-500">{cat.category}</span>
                                            <span className="font-medium text-slate-700">₦{cat.total.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center py-2 border-b border-slate-100 pl-4 mt-2 font-bold bg-rose-50/50 rounded">
                                        <span className="text-slate-700">Total Expenses</span>
                                        <span className="text-rose-600 tracking-tight">- ₦{totalApprovedExpenses.toLocaleString()}</span>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center py-3 border-t-2 border-[#02275A] mt-4 bg-blue-50/50 p-2 rounded">
                                    <span className="text-[#02275A] font-black text-lg">Net Income</span>
                                    <span className="font-black text-[#02275A] text-lg tracking-tight">₦{netIncome.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-black text-[#02275A] mb-4">Expense Breakdown by Category</h3>
                            <div className="space-y-4">
                                {categoryTotals.length > 0 ? categoryTotals.map((cat, idx) => (
                                    <div key={cat.category}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-bold text-slate-700">{cat.category}</span>
                                            <span className="font-bold text-slate-800">₦{cat.total.toLocaleString()} ({Math.round((cat.total / totalApprovedExpenses) * 100)}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full ${['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500'][idx % 5]}`}
                                                style={{ width: `${(cat.total / totalApprovedExpenses) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center text-slate-400 py-10 italic">No approved expenses yet.</div>
                                )}
                            </div>

                            <h3 className="text-lg font-black text-[#02275A] mt-8 mb-4">Cash Position</h3>
                             <div className="space-y-3">
                                {accounts.filter(a => a.type === 'Asset').map(acc => (
                                     <div key={acc.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:border-[#02275A] hover:shadow-sm transition-all cursor-pointer group">
                                         <div className="flex items-center gap-3">
                                             <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                                                 <i className="fas fa-university"></i>
                                             </div>
                                             <div>
                                                 <p className="font-bold text-slate-800 group-hover:text-[#02275A] transition-colors">{acc.name}</p>
                                                 <p className="text-xs text-slate-500 font-mono">{acc.code} • {acc.description}</p>
                                             </div>
                                         </div>
                                         <div className="text-right">
                                             <p className="font-black text-slate-800 text-lg">₦{acc.balance.toLocaleString()}</p>
                                         </div>
                                     </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Expenses Tab */}
            {activeTab === 'expenses' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
                        <div>
                            <h2 className="text-lg font-black text-[#02275A]">Expense Management</h2>
                            <p className="text-sm text-slate-500">Approve accountant submissions and log direct expenses.</p>
                        </div>
                        <button onClick={() => setShowExpenseModal(true)} className="bg-[#02275A] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#03367A] transition-colors flex items-center gap-2">
                            <i className="fas fa-plus"></i> Record Expense
                        </button>
                    </div>
                    <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full sm:w-96">
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input 
                                type="text"
                                placeholder="Search by description or submitter..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#02275A] outline-none"
                                value={expenseSearch}
                                onChange={e => setExpenseSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <select 
                                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#02275A]"
                                value={expenseFilterStatus}
                                onChange={e => setExpenseFilterStatus(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                            <select 
                                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#02275A]"
                                value={expenseFilterCategory}
                                onChange={e => setExpenseFilterCategory(e.target.value)}
                            >
                                <option value="All">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                    <th className="p-4 font-bold">Date & Desc</th>
                                    <th className="p-4 font-bold">Category</th>
                                    <th className="p-4 font-bold">Amount</th>
                                    <th className="p-4 font-bold">Status</th>
                                    <th className="p-4 font-bold">Submitted By</th>
                                    <th className="p-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredExpenses.map(expense => (
                                    <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">{expense.description}</span>
                                                <span className="text-xs text-slate-500 mt-0.5">{expense.date} {expense.recurring && <span className="text-blue-500"><i className="fas fa-sync-alt ml-1"></i> {expense.frequency}</span>}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold border border-slate-200">{expense.category}</span>
                                            {expense.marketingRelated && <span className="ml-2 px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs font-bold border border-purple-100"><i className="fas fa-bullhorn mr-1"></i> CAC</span>}
                                        </td>
                                        <td className="p-4 font-black">₦{expense.amount.toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                expense.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                                expense.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {expense.status === 'Pending' ? <i className="fas fa-clock mr-1"></i> : null}
                                                {expense.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 font-medium">
                                            {expense.submittedBy}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                {expense.status === 'Pending' && (
                                                    <>
                                                        <button onClick={() => handleApprove(expense.id)} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors" title="Approve">
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                        <button onClick={() => handleReject(expense.id)} className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors" title="Reject">
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={() => handleDeleteExpense(expense.id)} className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors" title="Delete">
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredExpenses.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <i className="fas fa-receipt text-3xl text-slate-300"></i>
                                                <p>No expenses found matching your filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Budgets & Set Limits */}
            {activeTab === 'budgets' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="p-6 border-b border-slate-200 bg-slate-50/50 rounded-t-xl">
                        <h2 className="text-lg font-black text-[#02275A]">Accountant Pre-Approved Limits</h2>
                        <p className="text-sm text-slate-500">Set maximum monthly limits that the accountant can disburse without individual CEO approval.</p>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {budgets.map(budget => (
                            <div key={budget.id} className="border border-slate-200 rounded-xl p-5 hover:border-[#02275A] transition-colors">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-800">{budget.category}</h3>
                                    <button onClick={() => { setSelectedBudget(budget); setShowBudgetModal(true); }} className="text-blue-600 text-sm font-bold hover:underline">Edit Limit</button>
                                </div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-500">Spent: ₦{budget.spentThisMonth.toLocaleString()}</span>
                                    <span className="font-bold text-slate-800">Limit: ₦{budget.monthlyLimit.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${budget.spentThisMonth > budget.monthlyLimit * 0.9 ? 'bg-rose-500' : budget.spentThisMonth > budget.monthlyLimit * 0.7 ? 'bg-amber-500' : 'bg-[#02275A]'}`} 
                                        style={{ width: `${Math.min(100, (budget.spentThisMonth / budget.monthlyLimit) * 100)}%` }}
                                    ></div>
                                </div>
                                {budget.spentThisMonth > budget.monthlyLimit * 0.9 && (
                                    <p className="text-xs text-rose-500 font-bold mt-3"><i className="fas fa-exclamation-triangle mr-1"></i> Approaching or exceeded limit</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Chart of Accounts Tab */}
            {activeTab === 'accounts' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                     <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
                        <div>
                            <h2 className="text-lg font-black text-[#02275A]">Chart of Accounts</h2>
                            <p className="text-sm text-slate-500">General ledger accounts supporting financial statements.</p>
                        </div>
                        <button onClick={() => setShowAccountModal(true)} className="bg-blue-50 text-blue-700 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-100 transition-colors flex items-center gap-2 border border-blue-200">
                            <i className="fas fa-plus"></i> New Account
                        </button>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                    <th className="p-4 font-bold">Code</th>
                                    <th className="p-4 font-bold">Name</th>
                                    <th className="p-4 font-bold">Type</th>
                                    <th className="p-4 font-bold text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {accounts.map(acc => (
                                    <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-mono text-sm text-slate-500">{acc.code}</td>
                                        <td className="p-4 font-bold text-slate-800">{acc.name}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold border border-slate-200">{acc.type}</span>
                                        </td>
                                        <td className="p-4 text-right font-black">₦{acc.balance.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Payroll Tab */}
            {activeTab === 'payroll' && (
                <div>
                    <AdminPayrollView />
                </div>
            )}

            {/* Expense Modal */}
            {showExpenseModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-[#02275A]">Record New Expense</h3>
                            <button onClick={() => setShowExpenseModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <form onSubmit={handleAddExpense} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                                        <select 
                                            className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:border-[#02275A] outline-none"
                                            value={newExpense.category}
                                            onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                                            required
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount (₦)</label>
                                        <input 
                                            type="number" 
                                            className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:border-[#02275A] outline-none"
                                            value={newExpense.amount || ''}
                                            onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:border-[#02275A] outline-none"
                                        placeholder="e.g. Facebook Ads"
                                        value={newExpense.description}
                                        onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Account to Debit</label>
                                    <select 
                                        className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:border-[#02275A] outline-none"
                                        value={newExpense.accountId}
                                        onChange={e => setNewExpense({...newExpense, accountId: e.target.value})}
                                        required
                                    >
                                        {accounts.filter(a => a.type === 'Expense' || a.type === 'Asset').map(a => (
                                            <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <input 
                                        type="checkbox" 
                                        id="recurring" 
                                        className="w-4 h-4 rounded text-[#02275A] focus:ring-[#02275A]"
                                        checked={newExpense.recurring}
                                        onChange={e => setNewExpense({...newExpense, recurring: e.target.checked})}
                                    />
                                    <label htmlFor="recurring" className="text-sm font-bold text-slate-700 select-none cursor-pointer">This is a recurring expense</label>
                                </div>
                                {newExpense.recurring && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Frequency</label>
                                        <select 
                                            className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:border-[#02275A] outline-none"
                                            value={newExpense.frequency}
                                            onChange={e => setNewExpense({...newExpense, frequency: e.target.value as any})}
                                        >
                                            <option value="Weekly">Weekly</option>
                                            <option value="Monthly">Monthly</option>
                                            <option value="Yearly">Yearly</option>
                                        </select>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 bg-purple-50 p-4 rounded-lg border border-purple-100">
                                    <input 
                                        type="checkbox" 
                                        id="marketing" 
                                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-purple-300"
                                        checked={newExpense.marketingRelated}
                                        onChange={e => setNewExpense({...newExpense, marketingRelated: e.target.checked})}
                                    />
                                    <label htmlFor="marketing" className="text-sm font-bold text-purple-900 select-none cursor-pointer">Include in CAC / Marketing Reports</label>
                                    <div className="group relative ml-auto">
                                        <i className="fas fa-question-circle text-purple-400 hover:text-purple-600 cursor-help"></i>
                                        <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-800 text-white text-xs p-2 rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
                                            This flags the expense to be automatically calculated in Customer Acquisition Cost (CAC) on the CEO Command Center.
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowExpenseModal(false)} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 px-4 py-3 bg-[#02275A] text-white rounded-xl font-bold hover:bg-[#03367A] transition-colors shadow-md">Record Expense</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Account Modal */}
            {showAccountModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-[#02275A]">New Account</h3>
                            <button onClick={() => setShowAccountModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleAddAccount} className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Code</label>
                                        <input 
                                            required
                                            type="text" 
                                            className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:border-[#02275A] outline-none"
                                            placeholder="e.g. 5050"
                                            value={newAccount.code}
                                            onChange={e => setNewAccount({...newAccount, code: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Account Name</label>
                                        <input 
                                            required
                                            type="text" 
                                            className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:border-[#02275A] outline-none"
                                            placeholder="e.g. Legal Fees"
                                            value={newAccount.name}
                                            onChange={e => setNewAccount({...newAccount, name: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                                    <select 
                                        className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:border-[#02275A] outline-none"
                                        value={newAccount.type}
                                        onChange={e => setNewAccount({...newAccount, type: e.target.value as any})}
                                    >
                                        <option value="Expense">Expense</option>
                                        <option value="Revenue">Revenue</option>
                                        <option value="Asset">Asset</option>
                                        <option value="Liability">Liability</option>
                                        <option value="Equity">Equity</option>
                                    </select>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowAccountModal(false)} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold">Cancel</button>
                                    <button type="submit" className="flex-1 px-4 py-3 bg-[#02275A] text-white rounded-xl font-bold">Add Account</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Budget Modal */}
            {showBudgetModal && selectedBudget && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-[#02275A]">Edit Budget Limit</h3>
                            <button onClick={() => setShowBudgetModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleUpdateBudget} className="space-y-4">
                                <div className="mb-4">
                                    <p className="text-sm text-slate-500 mb-1">Category</p>
                                    <p className="font-bold text-slate-800">{selectedBudget.category}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Monthly Limit (₦)</label>
                                    <input 
                                        type="number" 
                                        className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:border-[#02275A] outline-none"
                                        value={selectedBudget.monthlyLimit}
                                        onChange={e => setSelectedBudget({...selectedBudget, monthlyLimit: Number(e.target.value)})}
                                        required
                                    />
                                </div>
                                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                                    <p className="text-xs text-amber-700"><i className="fas fa-info-circle mr-1"></i> Increasing the budget allows the accountant to automatically approve expenses in this category up to the new limit.</p>
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <button type="button" onClick={() => setShowBudgetModal(false)} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold">Cancel</button>
                                    <button type="submit" className="flex-1 px-4 py-3 bg-[#02275A] text-white rounded-xl font-bold">Update Limit</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFinanceCenterView;
