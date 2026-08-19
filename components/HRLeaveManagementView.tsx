import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAlert } from '../contexts/AlertContext';
import { HRPublicHolidayManagementView } from './HRPublicHolidayManagementView';
import {
  LeaveType,
  LeaveEmailTemplate,
  LeaveRequestRecord,
  EmployeeLeaveBalance,
  LeaveAuditLog,
  DEFAULT_EMPLOYEES,
  getLeaveTypes,
  getLeaveTemplates,
  getEmployeeBalances,
  saveEmployeeBalances,
  getLeaveRequests,
  saveLeaveRequests,
  addLeaveAuditLog,
  dispatchLeaveNotification,
  calculateWorkingDays
} from './leaveUtils';

interface HRLeaveManagementViewProps {
  userDepartment?: string;
}

export const HRLeaveManagementView: React.FC<HRLeaveManagementViewProps> = ({ userDepartment }) => {
  const { showSuccess, showError, showWarning } = useAlert();

  // Active Sub Tab: 'requests' | 'types' | 'holidays' | 'templates' | 'historical' | 'balances' | 'audit'
  const [activeTab, setActiveTab] = useState<
    'requests' | 'types' | 'holidays' | 'templates' | 'historical' | 'balances' | 'audit'
  >('requests');

  // Core Data States
  const [requests, setRequests] = useState<LeaveRequestRecord[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [templates, setTemplates] = useState<LeaveEmailTemplate[]>([]);
  const [balances, setBalances] = useState<EmployeeLeaveBalance[]>([]);
  const [auditLogs, setAuditLogs] = useState<LeaveAuditLog[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals & Sub-forms
  const [viewRequestModal, setViewRequestModal] = useState<LeaveRequestRecord | null>(null);
  const [approvalModal, setApprovalModal] = useState<LeaveRequestRecord | null>(null);
  const [approvalDecision, setApprovalDecision] = useState<'Approved' | 'Rejected'>('Approved');
  const [approvalComment, setApprovalComment] = useState('');
  const [approverRoleType, setApproverRoleType] = useState<'Team Lead' | 'HR'>('HR');

  // Leave Type Form Modal State
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [deleteTypeModal, setDeleteTypeModal] = useState<LeaveType | null>(null);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [typeName, setTypeName] = useState('');
  const [typeDefaultDays, setTypeDefaultDays] = useState(15);
  const [typeDescription, setTypeDescription] = useState('');
  const [typeStatus, setTypeStatus] = useState<'Active' | 'Inactive'>('Active');

  // Email Template Modal State
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LeaveEmailTemplate | null>(null);
  const [tplName, setTplName] = useState('');
  const [tplLeaveType, setTplLeaveType] = useState('Annual Leave');
  const [tplSubject, setTplSubject] = useState('');
  const [tplBody, setTplBody] = useState('');

  // Historical Entry Form State
  const [histEmployeeEmail, setHistEmployeeEmail] = useState(DEFAULT_EMPLOYEES[0].email);
  const [histLeaveType, setHistLeaveType] = useState('Annual Leave');
  const [histStartDate, setHistStartDate] = useState('');
  const [histEndDate, setHistEndDate] = useState('');
  const [histDays, setHistDays] = useState(1);
  const [histRemarks, setHistRemarks] = useState('');

  // Balance Adjustment Modal State
  const [balanceAdjustModal, setBalanceAdjustModal] = useState<EmployeeLeaveBalance | null>(null);
  const [adjustType, setAdjustType] = useState('Annual Leave');
  const [adjustTotalDays, setAdjustTotalDays] = useState(15);
  const [adjustUsedDays, setAdjustUsedDays] = useState(0);

  // Load all data
  const loadAllData = useCallback(() => {
    setRequests(getLeaveRequests());
    setLeaveTypes(getLeaveTypes());
    setTemplates(getLeaveTemplates());
    setBalances(getEmployeeBalances());

    const savedAudit = localStorage.getItem('company_leave_audit_logs');
    if (savedAudit) {
      try {
        setAuditLogs(JSON.parse(savedAudit));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    loadAllData();
    const handleUpdate = () => loadAllData();
    window.addEventListener('leaveDataUpdated', handleUpdate);
    return () => window.removeEventListener('leaveDataUpdated', handleUpdate);
  }, [loadAllData]);

  // Handle Leave Type Create/Edit
  const handleOpenTypeModal = (type?: LeaveType) => {
    if (type) {
      setEditingType(type);
      setTypeName(type.name);
      setTypeDefaultDays(type.defaultDays);
      setTypeDescription(type.description || '');
      setTypeStatus(type.status);
    } else {
      setEditingType(null);
      setTypeName('');
      setTypeDefaultDays(15);
      setTypeDescription('');
      setTypeStatus('Active');
    }
    setTypeModalOpen(true);
  };

  const handleSaveType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) {
      showError('Please enter a leave type name.');
      return;
    }

    let updated: LeaveType[];
    if (editingType) {
      updated = leaveTypes.map((t) =>
        t.id === editingType.id
          ? {
              ...t,
              name: typeName.trim(),
              defaultDays: Number(typeDefaultDays) || 0,
              description: typeDescription.trim(),
              status: typeStatus
            }
          : t
      );
      showSuccess(`Leave Type "${typeName}" updated.`);
    } else {
      const newType: LeaveType = {
        id: `LT-${Date.now()}`,
        name: typeName.trim(),
        defaultDays: Number(typeDefaultDays) || 0,
        description: typeDescription.trim(),
        status: typeStatus,
        createdAt: new Date().toISOString().split('T')[0]
      };
      updated = [...leaveTypes, newType];
      showSuccess(`New Leave Type "${typeName}" created.`);
    }

    setLeaveTypes(updated);
    localStorage.setItem('company_leave_types', JSON.stringify(updated));
    addLeaveAuditLog(
      'HR Admin',
      editingType ? 'Updated Leave Type' : 'Created Leave Type',
      editingType ? editingType.id : 'NEW_TYPE',
      `Leave Type: ${typeName}, Quota: ${typeDefaultDays} days, Status: ${typeStatus}`
    );
    setTypeModalOpen(false);
  };

  const handleToggleTypeStatus = (type: LeaveType) => {
    const newStatus = type.status === 'Active' ? 'Inactive' : 'Active';
    const updated = leaveTypes.map((t) => (t.id === type.id ? { ...t, status: newStatus } : t));
    setLeaveTypes(updated);
    localStorage.setItem('company_leave_types', JSON.stringify(updated));
    showSuccess(`Leave type "${type.name}" is now ${newStatus}.`);
  };

  const handleConfirmDeleteType = () => {
    if (!deleteTypeModal) return;
    const typeToDelete = deleteTypeModal;

    const updated = leaveTypes.filter((t) => t.id !== typeToDelete.id);
    setLeaveTypes(updated);
    localStorage.setItem('company_leave_types', JSON.stringify(updated));
    window.dispatchEvent(new Event('leaveDataUpdated'));

    addLeaveAuditLog(
      'HR Admin',
      'Deleted Leave Type',
      typeToDelete.id,
      `Deleted leave type "${typeToDelete.name}" (Default Quota: ${typeToDelete.defaultDays} days).`
    );

    showSuccess(`Leave Type "${typeToDelete.name}" deleted successfully.`);
    setDeleteTypeModal(null);
  };

  // Handle Template Create/Edit
  const handleOpenTemplateModal = (tpl?: LeaveEmailTemplate) => {
    if (tpl) {
      setEditingTemplate(tpl);
      setTplName(tpl.templateName);
      setTplLeaveType(tpl.leaveType);
      setTplSubject(tpl.subject);
      setTplBody(tpl.emailBody);
    } else {
      setEditingTemplate(null);
      setTplName('');
      setTplLeaveType(leaveTypes[0]?.name || 'Annual Leave');
      setTplSubject('Leave Request: {{Leave Type}} - {{Employee Name}}');
      setTplBody(`Dear Team Lead and HR,\n\nI request {{Leave Type}} for {{Working Days}} days starting {{Start Date}} to {{End Date}}.\n\nHandover: {{Handover Employee}}\nAvailability: {{Availability}}.\n\nThanks,\n{{Employee Name}}`);
    }
    setTemplateModalOpen(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplName.trim() || !tplSubject.trim() || !tplBody.trim()) {
      showError('Please fill out template name, subject, and body.');
      return;
    }

    let updated: LeaveEmailTemplate[];
    if (editingTemplate) {
      updated = templates.map((t) =>
        t.id === editingTemplate.id
          ? {
              ...t,
              templateName: tplName.trim(),
              leaveType: tplLeaveType,
              subject: tplSubject.trim(),
              emailBody: tplBody.trim()
            }
          : t
      );
      showSuccess(`Template "${tplName}" updated.`);
    } else {
      const newTpl: LeaveEmailTemplate = {
        id: `TPL-${Date.now()}`,
        templateName: tplName.trim(),
        leaveType: tplLeaveType,
        subject: tplSubject.trim(),
        emailBody: tplBody.trim()
      };
      updated = [...templates, newTpl];
      showSuccess(`New Email Template "${tplName}" created.`);
    }

    setTemplates(updated);
    localStorage.setItem('company_leave_templates', JSON.stringify(updated));
    addLeaveAuditLog('HR Admin', 'Saved Leave Template', 'TEMPLATE', `Template: ${tplName} for ${tplLeaveType}`);
    setTemplateModalOpen(false);
  };

  // Handle Historical Leave Entry Submit
  const handleSaveHistoricalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!histStartDate || !histEndDate) {
      showError('Please select start and end dates.');
      return;
    }

    const calculatedDays = calculateWorkingDays(histStartDate, histEndDate) || histDays;
    const empObj = DEFAULT_EMPLOYEES.find((e) => e.email === histEmployeeEmail);

    const histReqId = `HIST-${Math.floor(1000 + Math.random() * 9000)}`;

    const histRecord: LeaveRequestRecord = {
      id: histReqId,
      employeeName: empObj ? empObj.name : 'Employee',
      employeeEmail: histEmployeeEmail,
      department: empObj ? empObj.department : 'Sales',
      leaveType: histLeaveType,
      startDate: histStartDate,
      endDate: histEndDate,
      workingDays: calculatedDays,
      handoverEmployeeName: 'HR Manual Record',
      handoverEmployeeEmail: 'grace.hr@prokip.com',
      availability: 'Not Applicable',
      subject: `Historical Leave Record: ${histLeaveType}`,
      emailBody: `Historical leave entry recorded by HR. Remarks: ${histRemarks || 'None'}`,
      status: 'Approved',
      submittedDate: new Date().toISOString().split('T')[0],
      approver: 'HR Historical Entry',
      approverRole: 'HR',
      approvalDate: new Date().toISOString().split('T')[0],
      approvalComments: histRemarks || 'Historical Leave Entry recorded by HR',
      isHistorical: true
    };

    // Deduct immediately from employee's balance!
    const allBals = [...balances];
    let empBal = allBals.find((b) => b.employeeEmail.toLowerCase() === histEmployeeEmail.toLowerCase());
    if (empBal) {
      if (!empBal.balances[histLeaveType]) {
        const typeObj = leaveTypes.find((t) => t.name === histLeaveType);
        const quota = typeObj?.defaultDays || 15;
        empBal.balances[histLeaveType] = { totalDays: quota, usedDays: 0, remainingDays: quota };
      }
      empBal.balances[histLeaveType].usedDays += calculatedDays;
      empBal.balances[histLeaveType].remainingDays = Math.max(
        0,
        empBal.balances[histLeaveType].totalDays - empBal.balances[histLeaveType].usedDays
      );
      saveEmployeeBalances(allBals);
    }

    // Save request
    const updatedReqs = [histRecord, ...requests];
    saveLeaveRequests(updatedReqs);

    // Audit log
    addLeaveAuditLog(
      'HR Admin',
      'Created Historical Leave Entry',
      histReqId,
      `Recorded ${calculatedDays} working days of ${histLeaveType} for ${empObj?.name}. Balance immediately reduced.`
    );

    showSuccess(`Historical leave entry recorded. ${calculatedDays} days deducted from ${empObj?.name}'s balance.`);

    // Reset Form
    setHistStartDate('');
    setHistEndDate('');
    setHistRemarks('');
  };

  // Handle Workflow Approval Action
  const handleConfirmApproval = () => {
    if (!approvalModal) return;
    const req = approvalModal;
    const todayStr = new Date().toISOString().split('T')[0];
    const approverName = approverRoleType === 'Team Lead' ? 'Adaeze O. (Team Lead)' : 'Grace Admin (HR)';

    const newStatus = approvalDecision === 'Approved' ? 'Approved' : 'Rejected';

    const updatedReq: LeaveRequestRecord = {
      ...req,
      status: newStatus,
      approver: approverName,
      approverRole: approverRoleType,
      approvalDate: todayStr,
      approvalComments: approvalComment || `${approverRoleType} ${approvalDecision.toLowerCase()} the request.`
    };

    // If Approved -> Automatically deduct approved working days from employee's leave balance!
    if (approvalDecision === 'Approved') {
      const allBals = [...balances];
      let empBal = allBals.find((b) => b.employeeEmail.toLowerCase() === req.employeeEmail.toLowerCase());
      if (empBal) {
        if (!empBal.balances[req.leaveType]) {
          const typeObj = leaveTypes.find((t) => t.name === req.leaveType);
          const quota = typeObj?.defaultDays || 15;
          empBal.balances[req.leaveType] = { totalDays: quota, usedDays: 0, remainingDays: quota };
        }
        empBal.balances[req.leaveType].usedDays += req.workingDays;
        empBal.balances[req.leaveType].remainingDays = Math.max(
          0,
          empBal.balances[req.leaveType].totalDays - empBal.balances[req.leaveType].usedDays
        );
        saveEmployeeBalances(allBals);
      }
    }

    const updatedList = requests.map((r) => (r.id === req.id ? updatedReq : r));
    saveLeaveRequests(updatedList);

    addLeaveAuditLog(
      `${approverRoleType} (${approverName})`,
      `${approvalDecision} Leave Request`,
      req.id,
      `${req.leaveType} (${req.workingDays} days) for ${req.employeeName}. Decision: ${approvalDecision}.`
    );

    // Dispatch Notifications
    dispatchLeaveNotification(
      req.employeeEmail,
      'Employee',
      `Leave Request ${req.id} ${approvalDecision}`,
      `Your request for ${req.leaveType} (${req.workingDays} working days) has been ${approvalDecision.toLowerCase()} by ${approverRoleType}.`,
      approvalDecision === 'Approved' ? 'success' : 'alert'
    );

    dispatchLeaveNotification(
      'grace.hr@prokip.com',
      'HR',
      `Leave Decision Logged: ${req.id}`,
      `Request ${req.id} by ${req.employeeName} was ${approvalDecision.toLowerCase()} by ${approverName}.`,
      'info'
    );

    showSuccess(`Leave Request ${req.id} updated to ${approvalDecision}.`);
    setApprovalModal(null);
    setApprovalComment('');
  };

  // Yearly Leave Reset
  const handleYearlyReset = () => {
    if (
      !window.confirm(
        'Are you sure you want to perform the Annual Leave Reset?\n\nThis will reset all employee leave balances to their default quotas while preserving full historical records.'
      )
    ) {
      return;
    }

    const allBals = [...balances];
    const types = leaveTypes.filter((t) => t.status === 'Active');

    const resetBals = allBals.map((emp) => {
      const newBalances: Record<string, { totalDays: number; usedDays: number; remainingDays: number }> = {};
      types.forEach((t) => {
        newBalances[t.name] = {
          totalDays: t.defaultDays,
          usedDays: 0,
          remainingDays: t.defaultDays
        };
      });
      return {
        ...emp,
        balances: newBalances
      };
    });

    saveEmployeeBalances(resetBals);
    setBalances(resetBals);

    addLeaveAuditLog(
      'HR Admin',
      'Annual Leave Reset Executed',
      'YEARLY_RESET',
      'All active leave quotas reset to full default values. Leave history preserved.'
    );

    showSuccess('Annual Leave Reset successfully executed! New leave cycle initialized.');
  };

  // Filtered Requests Queue
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchDept = selectedDept === 'All' || req.department.toLowerCase() === selectedDept.toLowerCase();
      const matchStatus = selectedStatus === 'All' || req.status === selectedStatus;
      const matchSearch =
        !searchQuery ||
        req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.leaveType.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDept && matchStatus && matchSearch;
    });
  }, [requests, selectedDept, selectedStatus, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top HR Header */}
      <div className="bg-[#02275A] text-white rounded-2xl p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-400 text-[#02275A] flex items-center justify-center text-xl font-black shadow-md">
            <i className="fas fa-user-shield"></i>
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">HR Leave Management Hub</h2>
            <p className="text-xs text-blue-200 mt-0.5">
              Comprehensive workflow for leave policies, email templates, historical logs, approvals & balance resets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleYearlyReset}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <i className="fas fa-rotate-left"></i> Annual Leave Reset
          </button>
        </div>
      </div>

      {/* Main Sub Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center gap-1">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'requests' ? 'bg-[#02275A] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <i className="fas fa-[#02275A] fa-tasks"></i> Approval Queue
          {requests.filter((r) => r.status === 'Pending').length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-amber-400 text-[#02275A] text-[10px] font-black rounded-full">
              {requests.filter((r) => r.status === 'Pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('types')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'types' ? 'bg-[#02275A] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <i className="fas fa-sliders-h"></i> Leave Types ({leaveTypes.length})
        </button>

        <button
          onClick={() => setActiveTab('holidays')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'holidays' ? 'bg-[#02275A] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <i className="fas fa-calendar-alt text-amber-500"></i> Public Holidays
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'templates' ? 'bg-[#02275A] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <i className="fas fa-envelope-open-text"></i> Email Templates
        </button>

        <button
          onClick={() => setActiveTab('historical')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'historical' ? 'bg-[#02275A] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <i className="fas fa-clock-rotate-left"></i> Historical Entry
        </button>

        <button
          onClick={() => setActiveTab('balances')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'balances' ? 'bg-[#02275A] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <i className="fas fa-wallet"></i> Employee Balances
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'audit' ? 'bg-[#02275A] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <i className="fas fa-list-check"></i> Audit Trail
        </button>
      </div>

      {/* TAB 1: APPROVAL QUEUE */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
          {/* Filters Bar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative min-w-[220px]">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input
                  type="text"
                  placeholder="Search requester, ID, leave type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#02275A]"
                />
              </div>

              <div>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="All">All Departments</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Support">Support</option>
                  <option value="Finance">Finance</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-500">
              Showing {filteredRequests.length} of {requests.length} requests
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4 text-center">Working Days</th>
                  <th className="py-3 px-4">Handover</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-black text-[#02275A]">{req.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{req.employeeName}</div>
                      <div className="text-[10px] text-slate-400">{req.department}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">{req.leaveType}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600 whitespace-nowrap">
                      {req.startDate} to {req.endDate}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-[#02275A] font-black rounded-md text-xs">
                        {req.workingDays} Days
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{req.handoverEmployeeName || 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      {req.status === 'Approved' ? (
                        <span className="px-2.5 py-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full uppercase">
                          Approved
                        </span>
                      ) : req.status === 'Rejected' ? (
                        <span className="px-2.5 py-1 text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 rounded-full uppercase">
                          Rejected
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 rounded-full uppercase">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setViewRequestModal(req)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-all"
                        title="View Email Content & Details"
                      >
                        <i className="fas fa-eye"></i> View
                      </button>

                      {req.status === 'Pending' && (
                        <button
                          onClick={() => {
                            setApprovalModal(req);
                            setApprovalDecision('Approved');
                          }}
                          className="px-3 py-1.5 bg-[#02275A] hover:bg-opacity-95 text-white font-bold text-[11px] rounded-lg shadow-xs transition-all"
                        >
                          <i className="fas fa-check-double mr-1"></i> Process
                        </button>
                      )}

                      {/* HR Override Option for processed requests */}
                      {req.status !== 'Pending' && (
                        <button
                          onClick={() => {
                            setApprovalModal(req);
                            setApproverRoleType('HR');
                          }}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] rounded-lg border border-amber-200 transition-all"
                          title="HR Override Decision"
                        >
                          <i className="fas fa-[#02275A] fa-shield-alt"></i> HR Override
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LEAVE TYPE MANAGEMENT */}
      {activeTab === 'types' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#02275A]">Leave Type Management</h3>
              <p className="text-xs text-slate-500">
                Configure leave types, set default working days quota, description, and status.
              </p>
            </div>
            <button
              onClick={() => handleOpenTypeModal()}
              className="px-4 py-2.5 bg-[#02275A] hover:bg-opacity-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <i className="fas fa-plus"></i> Create New Leave Type
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaveTypes.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-extrabold text-sm text-[#02275A]">{t.name}</h4>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase ${
                        t.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-300'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-600 mb-2">
                    Default Quota:{' '}
                    <span className="text-[#02275A] font-black text-sm">{t.defaultDays} Working Days</span>
                  </p>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                    {t.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleOpenTypeModal(t)}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <i className="fas fa-edit"></i> Edit Type
                    </button>

                    <button
                      onClick={() => handleToggleTypeStatus(t)}
                      className={`text-xs font-bold ${
                        t.status === 'Active' ? 'text-amber-600 hover:underline' : 'text-emerald-600 hover:underline'
                      } cursor-pointer`}
                    >
                      {t.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>

                  <button
                    onClick={() => setDeleteTypeModal(t)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1 cursor-pointer"
                    title="Delete Leave Type"
                  >
                    <i className="fas fa-trash-alt"></i> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB FOR PUBLIC HOLIDAYS MANAGEMENT */}
      {activeTab === 'holidays' && (
        <HRPublicHolidayManagementView actorName="Grace Admin (HR)" />
      )}

      {/* TAB 3: EMAIL TEMPLATE MANAGEMENT */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#02275A]">Leave Email Templates</h3>
              <p className="text-xs text-slate-500">
                Manage default email templates and placeholders auto-loaded into the Email Composer.
              </p>
            </div>
            <button
              onClick={() => handleOpenTemplateModal()}
              className="px-4 py-2.5 bg-[#02275A] hover:bg-opacity-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <i className="fas fa-plus"></i> Create Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div key={tpl.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#02275A]">{tpl.templateName}</h4>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Linked to: {tpl.leaveType}
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenTemplateModal(tpl)}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <i className="fas fa-[#02275A] fa-edit"></i> Edit
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Subject Template
                  </label>
                  <p className="text-xs font-bold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    {tpl.subject}
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Body Template Preview
                  </label>
                  <pre className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 whitespace-pre-wrap font-mono leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                    {tpl.emailBody}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: HISTORICAL LEAVE ENTRY */}
      {activeTab === 'historical' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-3xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-[#02275A] flex items-center gap-2">
              <i className="fas fa-clock-rotate-left text-amber-500"></i> Manually Record Historical Leave
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Record leave already taken before this system was introduced. Saving will immediately reduce the employee's available leave balance.
            </p>
          </div>

          <form onSubmit={handleSaveHistoricalEntry} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Employee *
                </label>
                <select
                  value={histEmployeeEmail}
                  onChange={(e) => setHistEmployeeEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#02275A]"
                  required
                >
                  {DEFAULT_EMPLOYEES.map((e) => (
                    <option key={e.id} value={e.email}>
                      {e.name} ({e.department} - {e.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Leave Type *
                </label>
                <select
                  value={histLeaveType}
                  onChange={(e) => setHistLeaveType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#02275A]"
                  required
                >
                  {leaveTypes.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={histStartDate}
                  onChange={(e) => setHistStartDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#02275A]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  value={histEndDate}
                  onChange={(e) => setHistEndDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#02275A]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Calculated Working Days
                </label>
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-black text-[#02275A]">
                  {calculateWorkingDays(histStartDate, histEndDate) || histDays} Working Days
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Remarks / Reference Note
              </label>
              <textarea
                rows={3}
                value={histRemarks}
                onChange={(e) => setHistRemarks(e.target.value)}
                placeholder="Enter remarks e.g., Approved in offline paper file #402..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800"
              ></textarea>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-[#02275A] hover:bg-opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <i className="fas fa-save text-amber-400"></i> Record Historical Leave & Deduct Balance
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: EMPLOYEE BALANCES */}
      {activeTab === 'balances' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#02275A]">
              Employee Leave Balances Directory ({balances.length} Employees)
            </h3>
            <span className="text-xs text-slate-500">
              Live synchronized quotas across active leave types.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  {leaveTypes.map((t) => (
                    <th key={t.id} className="py-3 px-4 text-center">
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {balances.map((emp) => (
                  <tr key={emp.employeeEmail} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <div>{emp.employeeName}</div>
                      <div className="text-[10px] text-slate-400">{emp.employeeEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">{emp.department}</td>
                    {leaveTypes.map((t) => {
                      const b = emp.balances[t.name] || {
                        totalDays: t.defaultDays,
                        usedDays: 0,
                        remainingDays: t.defaultDays
                      };
                      return (
                        <td key={t.id} className="py-3.5 px-4 text-center font-bold">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-[#02275A]">
                            <span className="text-emerald-600 font-extrabold">{b.remainingDays}</span> /{' '}
                            {b.totalDays}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-[#02275A]">Leave Management Audit Logs</h3>
            <span className="text-xs text-slate-500">System logged records of all leave activities</span>
          </div>

          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No audit logs recorded yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#02275A]">{log.action}</span>
                    <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-700 font-medium">{log.details}</p>
                  <p className="text-[10px] text-slate-400 italic">Actor: {log.actor}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: VIEW FULL REQUEST EMAIL CONTENT */}
      {viewRequestModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden">
            <div className="bg-[#02275A] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <i className="fas fa-envelope-open text-amber-400"></i> Leave Request Email #{viewRequestModal.id}
              </h3>
              <button
                onClick={() => setViewRequestModal(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 font-semibold text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">From</span>
                  {viewRequestModal.employeeName} ({viewRequestModal.department})
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Leave Type</span>
                  {viewRequestModal.leaveType} ({viewRequestModal.workingDays} Working Days)
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Period</span>
                  {viewRequestModal.startDate} to {viewRequestModal.endDate}
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Handover Staff</span>
                  {viewRequestModal.handoverEmployeeName}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Subject</span>
                <p className="font-bold text-slate-900 p-2.5 bg-slate-100 rounded-lg">{viewRequestModal.subject}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Email Body</span>
                <pre className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto custom-scrollbar">
                  {viewRequestModal.emailBody}
                </pre>
              </div>

              {viewRequestModal.attachmentName && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2">
                  <i className="fas fa-paperclip"></i> Attached Document: {viewRequestModal.attachmentName}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewRequestModal(null)}
                className="px-4 py-2 bg-[#02275A] text-white font-bold text-xs rounded-xl"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPROVAL / HR OVERRIDE PROCESS */}
      {approvalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-[#02275A] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <i className="fas fa-check-circle text-amber-400"></i> Process Request #{approvalModal.id}
              </h3>
              <button
                onClick={() => setApprovalModal(null)}
                className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900">
                  {approvalModal.employeeName} ({approvalModal.department})
                </p>
                <p className="text-slate-600">
                  {approvalModal.leaveType} • {approvalModal.workingDays} Working Days ({approvalModal.startDate} to{' '}
                  {approvalModal.endDate})
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Acting Approver Role
                </label>
                <select
                  value={approverRoleType}
                  onChange={(e) => setApproverRoleType(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-[#02275A]"
                >
                  <option value="Team Lead">Team Lead Approval</option>
                  <option value="HR">HR Administrative Override</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Decision
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setApprovalDecision('Approved')}
                    className={`py-2.5 font-extrabold rounded-xl text-xs border transition-all ${
                      approvalDecision === 'Approved'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <i className="fas fa-check mr-1.5"></i> Approve Leave
                  </button>
                  <button
                    type="button"
                    onClick={() => setApprovalDecision('Rejected')}
                    className={`py-2.5 font-extrabold rounded-xl text-xs border transition-all ${
                      approvalDecision === 'Rejected'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <i className="fas fa-times mr-1.5"></i> Reject Leave
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Approval / Rejection Comments
                </label>
                <textarea
                  rows={3}
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  placeholder="Enter remarks or approval notes..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                ></textarea>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setApprovalModal(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproval}
                className="px-5 py-2 bg-[#02275A] text-white font-bold text-xs rounded-xl"
              >
                Submit Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT LEAVE TYPE */}
      {typeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-[#02275A] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingType ? `Edit Leave Type: ${editingType.name}` : 'Create New Leave Type'}
              </h3>
              <button onClick={() => setTypeModalOpen(false)} className="text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSaveType} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Leave Name *</label>
                <input
                  type="text"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  placeholder="e.g., Compassionate Leave"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-[#02275A]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Default Working Days Quota *
                </label>
                <input
                  type="number"
                  value={typeDefaultDays}
                  onChange={(e) => setTypeDefaultDays(Number(e.target.value))}
                  min={1}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-[#02275A]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={2}
                  value={typeDescription}
                  onChange={(e) => setTypeDescription(e.target.value)}
                  placeholder="Description of leave type policy..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                <select
                  value={typeStatus}
                  onChange={(e) => setTypeStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-[#02275A]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTypeModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#02275A] text-white font-bold rounded-xl">
                  Save Leave Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT EMAIL TEMPLATE */}
      {templateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden">
            <div className="bg-[#02275A] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingTemplate ? `Edit Template: ${editingTemplate.templateName}` : 'Create New Email Template'}
              </h3>
              <button onClick={() => setTemplateModalOpen(false)} className="text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Template Name *</label>
                  <input
                    type="text"
                    value={tplName}
                    onChange={(e) => setTplName(e.target.value)}
                    placeholder="e.g. Study Leave Template"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-[#02275A]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Target Leave Type *</label>
                  <select
                    value={tplLeaveType}
                    onChange={(e) => setTplLeaveType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-[#02275A]"
                  >
                    <option value="Default">Default (Fallback)</option>
                    {leaveTypes.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Subject Pattern *</label>
                <input
                  type="text"
                  value={tplSubject}
                  onChange={(e) => setTplSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-[#02275A]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Email Body Pattern *</label>
                <textarea
                  rows={6}
                  value={tplBody}
                  onChange={(e) => setTplBody(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800"
                  required
                ></textarea>
                <p className="text-[10px] text-slate-400 mt-1">
                  Placeholders: {'{{Employee Name}}'}, {'{{Leave Type}}'}, {'{{Start Date}}'}, {'{{End Date}}'},{' '}
                  {'{{Working Days}}'}, {'{{Remaining Leave}}'}, {'{{Handover Employee}}'}, {'{{Availability}}'}
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTemplateModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#02275A] text-white font-bold rounded-xl">
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: DELETE LEAVE TYPE CONFIRMATION */}
      {deleteTypeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center text-xl">
              <i className="fas fa-trash-alt"></i>
            </div>

            <div>
              <h3 className="font-extrabold text-base text-[#02275A]">Delete Leave Type?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete leave type <strong>"{deleteTypeModal.name}"</strong>?
                This action cannot be undone, and the type will be removed from future employee leave options.
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTypeModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteType}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-xs cursor-pointer"
              >
                Yes, Delete Leave Type
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
