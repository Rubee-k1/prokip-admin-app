import React, { useState } from 'react';
import { initialEmployees } from './AdminHRCenterView';

interface PayrollRecord {
    id: string;
    employeeName: string;
    role: string;
    department: string;
    salary: number;
    status: 'Paid' | 'Pending';
    paymentDate: string | null;
    bankDetails: string;
    month: string;
}

const mockPayrolls: PayrollRecord[] = [
    { id: 'PR-001', employeeName: 'Alice Johnson', role: 'Sales Manager', department: 'Sales', salary: 150000, status: 'Paid', paymentDate: '2023-10-25', bankDetails: 'GTBank - 0123456789', month: 'October 2023' },
    { id: 'PR-002', employeeName: 'Bob Smith', role: 'Customer Success', department: 'Support', salary: 120000, status: 'Pending', paymentDate: null, bankDetails: 'Access Bank - 0987654321', month: 'October 2023' },
    { id: 'PR-003', employeeName: 'Charlie Davis', role: 'Marketing Manager', department: 'Marketing', salary: 180000, status: 'Paid', paymentDate: '2023-10-25', bankDetails: 'Zenith Bank - 1122334455', month: 'October 2023' },
    { id: 'PR-004', employeeName: 'Diana Prince', role: 'Team Lead', department: 'Sales', salary: 200000, status: 'Pending', paymentDate: null, bankDetails: 'UBA - 5544332211', month: 'October 2023' },
    { id: 'PR-005', employeeName: 'Evan Wright', role: 'Call Agent', department: 'Support', salary: 80000, status: 'Paid', paymentDate: '2023-10-26', bankDetails: 'First Bank - 6677889900', month: 'October 2023' },
    { id: 'PR-006', employeeName: 'Alice Johnson', role: 'Sales Manager', department: 'Sales', salary: 150000, status: 'Pending', paymentDate: null, bankDetails: 'GTBank - 0123456789', month: 'November 2023' },
];

const AdminPayrollView: React.FC = () => {
    const [payrolls, setPayrolls] = useState<PayrollRecord[]>(mockPayrolls);
    const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending'>('All');
    const [monthFilter, setMonthFilter] = useState('October 2023');
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [newPayroll, setNewPayroll] = useState({
        employeeId: '',
        employeeName: '',
        role: '',
        department: '',
        salary: '',
        bankDetails: '',
        month: 'October 2023'
    });

    const handleEmployeeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const empId = e.target.value;
        if (!empId) {
            setNewPayroll({
                ...newPayroll,
                employeeId: '',
                employeeName: '',
                role: '',
                department: '',
                salary: '',
                bankDetails: ''
            });
            return;
        }

        const employee = initialEmployees.find(emp => emp.employeeId === empId);
        if (employee) {
            setNewPayroll({
                ...newPayroll,
                employeeId: empId,
                employeeName: `${employee.firstName} ${employee.lastName}`,
                role: employee.role || '',
                department: employee.department || '',
                salary: employee.salary ? String(employee.salary) : '',
                bankDetails: (employee.bankName && employee.accountNumber) ? `${employee.bankName} - ${employee.accountNumber}` : ''
            });
        }
    };

    const displayPayrolls = payrolls.filter(p => p.month === monthFilter);

    const totalPayroll = displayPayrolls.reduce((acc, curr) => acc + curr.salary, 0);
    const totalPaid = displayPayrolls.filter(p => p.status === 'Paid').reduce((acc, curr) => acc + curr.salary, 0);
    const totalPending = displayPayrolls.filter(p => p.status === 'Pending').reduce((acc, curr) => acc + curr.salary, 0);

    const filteredPayrolls = displayPayrolls.filter(p => {
        if (statusFilter !== 'All' && p.status !== statusFilter) return false;
        return true;
    });

    const handleMarkAsPaid = (id: string) => {
        setPayrolls(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, status: 'Paid', paymentDate: new Date().toISOString().split('T')[0] };
            }
            return p;
        }));
    };

    const handleMarkAsPending = (id: string) => {
        setPayrolls(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, status: 'Pending', paymentDate: null };
            }
            return p;
        }));
    };

    const handleAddPayroll = (e: React.FormEvent) => {
        e.preventDefault();
        const newRecord: PayrollRecord = {
            id: `PR-${Math.floor(100 + Math.random() * 900)}`,
            employeeName: newPayroll.employeeName,
            role: newPayroll.role,
            department: newPayroll.department,
            salary: Number(newPayroll.salary) || 0,
            status: 'Pending',
            paymentDate: null,
            bankDetails: newPayroll.bankDetails,
            month: newPayroll.month
        };
        setPayrolls([newRecord, ...payrolls]);
        setShowRecordModal(false);
        setNewPayroll({ employeeId: '', employeeName: '', role: '', department: '', salary: '', bankDetails: '', month: monthFilter });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-black text-[#02275A]">Employee Payroll</h2>
                    <p className="text-sm text-slate-500">Manage & track employee compensation and salary dispursements.</p>
                </div>
                <div className="flex items-center flex-wrap gap-3">
                    <select 
                        value={monthFilter} 
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#02275A] focus:border-transparent transition-all text-sm font-semibold whitespace-nowrap"
                    >
                        <option value="November 2023">November 2023</option>
                        <option value="October 2023">October 2023</option>
                        <option value="September 2023">September 2023</option>
                    </select>
                    <button 
                        onClick={() => {
                            setNewPayroll({ ...newPayroll, month: monthFilter });
                            setShowRecordModal(true);
                        }}
                        className="bg-[#02275A] hover:bg-[#033b8a] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap shadow-sm flex items-center gap-2"
                    >
                        <i className="fas fa-plus"></i>
                        <span>Record Payroll</span>
                    </button>
                    <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap shadow-sm flex items-center gap-2">
                        <i className="fas fa-file-export"></i>
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <i className="fas fa-money-bill-wave text-6xl text-[#02275A]"></i>
                        </div>
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#02275A]">
                                <i className="fas fa-calculator text-xl"></i>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Payroll</p>
                                <h3 className="text-2xl font-extrabold text-slate-900 leading-none mt-1">₦{totalPayroll.toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                            <i className="fas fa-users text-[#02275A]"></i>
                            <span>{payrolls.length} Employees total</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <i className="fas fa-check-circle text-6xl text-emerald-600"></i>
                        </div>
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                                <i className="fas fa-check-double text-xl"></i>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Total Paid</p>
                                <h3 className="text-2xl font-extrabold text-slate-900 leading-none mt-1">₦{totalPaid.toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                            <i className="fas fa-chart-pie text-emerald-500"></i>
                            <span>{totalPayroll > 0 ? ((totalPaid / totalPayroll) * 100).toFixed(0) : 0}% Dispursed</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <i className="fas fa-clock text-6xl text-amber-500"></i>
                        </div>
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                                <i className="fas fa-hourglass-half text-xl"></i>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-amber-600 uppercase tracking-wider">Total Pending</p>
                                <h3 className="text-2xl font-extrabold text-slate-900 leading-none mt-1">₦{totalPending.toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                            <i className="fas fa-exclamation-circle text-amber-500"></i>
                            <span>{payrolls.filter(p => p.status === 'Pending').length} pending payments</span>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 md:p-6 border-b border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <i className="fas fa-list text-[#02275A]"></i>
                            Payroll Records
                        </h2>
                        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg self-start md:self-auto">
                            {['All', 'Paid', 'Pending'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status as any)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                                        statusFilter === status 
                                        ? 'bg-white text-slate-900 shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-bold text-slate-500">
                                    <th className="p-4 px-6">Employee</th>
                                    <th className="p-4">Department & Role</th>
                                    <th className="p-4">Bank Details</th>
                                    <th className="p-4 text-right">Net Salary</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPayrolls.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold shadow-sm">
                                                    {record.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{record.employeeName}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{record.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-semibold text-slate-900 text-sm bg-slate-100 inline-block px-2.5 py-0.5 rounded text-xs">{record.department}</p>
                                            <p className="text-xs text-slate-500 font-medium mt-1">{record.role}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-slate-700 font-mono bg-slate-50 px-2 py-1 rounded inline-block border border-slate-100">{record.bankDetails}</p>
                                        </td>
                                        <td className="p-4 text-right">
                                            <p className="font-extrabold text-slate-900">₦{record.salary.toLocaleString()}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${record.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                <i className={`fas ${record.status === 'Paid' ? 'fa-check-circle' : 'fa-clock'}`}></i>
                                                {record.status}
                                            </div>
                                            {record.paymentDate && (
                                                <p className="text-[10px] text-slate-500 mt-1 font-medium pl-1">On {record.paymentDate}</p>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {record.status === 'Pending' ? (
                                                <button 
                                                    onClick={() => handleMarkAsPaid(record.id)}
                                                    className="bg-[#02275A] hover:bg-[#033b8a] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm"
                                                >
                                                    Mark Paid
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleMarkAsPending(record.id)}
                                                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                                                >
                                                    Undo
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredPayrolls.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-slate-500">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <i className="fas fa-file-invoice text-2xl text-slate-300"></i>
                                            </div>
                                            <p className="font-medium">No payroll records found for the selected filters.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            {/* Record Payroll Modal */}
            {showRecordModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Record New Payroll</h3>
                                <p className="text-sm text-slate-500">Add compensation details for an employee.</p>
                            </div>
                            <button 
                                onClick={() => setShowRecordModal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <form id="record-payroll-form" onSubmit={handleAddPayroll} className="space-y-5">
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Employee *</label>
                                        <select 
                                            required
                                            value={newPayroll.employeeId}
                                            onChange={handleEmployeeSelect}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#02275A] focus:bg-white transition-all text-sm"
                                        >
                                            <option value="">Select Employee...</option>
                                            {initialEmployees.map(emp => (
                                                <option key={emp.employeeId} value={emp.employeeId}>
                                                    {emp.firstName} {emp.lastName} ({emp.department})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Month *</label>
                                        <select 
                                            required
                                            value={newPayroll.month}
                                            onChange={(e) => setNewPayroll({...newPayroll, month: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#02275A] focus:bg-white transition-all text-sm"
                                        >
                                            <option value="November 2023">November 2023</option>
                                            <option value="October 2023">October 2023</option>
                                            <option value="September 2023">September 2023</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Department *</label>
                                        <select 
                                            required
                                            value={newPayroll.department}
                                            onChange={(e) => setNewPayroll({...newPayroll, department: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#02275A] focus:bg-white transition-all text-sm"
                                        >
                                            <option value="Sales">Sales</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Support">Support</option>
                                            <option value="Engineering">Engineering</option>
                                            <option value="Human Resources">Human Resources</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Role *</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={newPayroll.role}
                                            onChange={(e) => setNewPayroll({...newPayroll, role: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#02275A] focus:bg-white transition-all text-sm"
                                            placeholder="e.g. Sales Executive"
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700">Net Salary (₦) *</label>
                                    <input 
                                        type="number" 
                                        required
                                        min="0"
                                        value={newPayroll.salary}
                                        onChange={(e) => setNewPayroll({...newPayroll, salary: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#02275A] focus:bg-white transition-all text-sm font-mono"
                                        placeholder="e.g. 150000"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700">Bank Details *</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={newPayroll.bankDetails}
                                        onChange={(e) => setNewPayroll({...newPayroll, bankDetails: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#02275A] focus:bg-white transition-all text-sm font-mono"
                                        placeholder="e.g. GTBank - 0123456789"
                                    />
                                </div>
                                
                            </form>
                        </div>
                        
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                            <button 
                                type="button"
                                onClick={() => setShowRecordModal(false)}
                                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                form="record-payroll-form"
                                className="px-5 py-2.5 text-sm font-bold text-white bg-[#02275A] hover:bg-[#033b8a] rounded-xl transition-colors shadow-sm flex items-center gap-2"
                            >
                                <i className="fas fa-save"></i> Save Payroll
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPayrollView;
