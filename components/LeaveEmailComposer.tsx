import React, { useState, useEffect, useMemo } from 'react';
import { useAlert } from '../contexts/AlertContext';
import {
  LeaveType,
  LeaveEmailTemplate,
  OrganizationEmployee,
  DEFAULT_EMPLOYEES,
  getLeaveTypes,
  getLeaveTemplates,
  getSingleEmployeeBalanceRecord,
  calculateWorkingDays,
  replaceTemplatePlaceholders,
  saveLeaveRequests,
  getLeaveRequests,
  saveEmployeeBalances,
  getEmployeeBalances,
  addLeaveAuditLog,
  dispatchLeaveNotification
} from './leaveUtils';

interface LeaveEmailComposerProps {
  employeeName?: string;
  employeeEmail?: string;
  department?: string;
  isTeamLead?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const LeaveEmailComposer: React.FC<LeaveEmailComposerProps> = ({
  employeeName = 'Test Member',
  employeeEmail = 'user@prokip.africa',
  department = 'Sales',
  isTeamLead = false,
  onSuccess,
  onCancel
}) => {
  const { showSuccess, showError, showWarning } = useAlert();

  // Load Active Leave Types only
  const allTypes = useMemo(() => getLeaveTypes(), []);
  const activeTypes = useMemo(() => allTypes.filter((t) => t.status === 'Active'), [allTypes]);

  // Load Templates
  const templates = useMemo(() => getLeaveTemplates(), []);

  // Employee Balance Record
  const [balanceRecord, setBalanceRecord] = useState(() =>
    getSingleEmployeeBalanceRecord(employeeEmail, employeeName, department, isTeamLead)
  );

  // Form State
  const [selectedLeaveTypeName, setSelectedLeaveTypeName] = useState<string>(
    activeTypes[0]?.name || 'Annual Leave'
  );
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [handoverEmail, setHandoverEmail] = useState<string>('');
  const [availability, setAvailability] = useState<string>('Reachable by Phone');
  const [subject, setSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handover Employee options (exclude self)
  const availableHandoverEmployees = useMemo(
    () => DEFAULT_EMPLOYEES.filter((emp) => emp.email.toLowerCase() !== employeeEmail.toLowerCase()),
    [employeeEmail]
  );

  // Selected Handover Employee object
  const selectedHandoverObj = useMemo(
    () => availableHandoverEmployees.find((e) => e.email === handoverEmail) || null,
    [availableHandoverEmployees, handoverEmail]
  );

  // Calculate Working Days (skipping weekends)
  const workingDays = useMemo(() => {
    return calculateWorkingDays(startDate, endDate);
  }, [startDate, endDate]);

  // Selected Leave Type Stats
  const selectedTypeObj = useMemo(
    () => activeTypes.find((t) => t.name === selectedLeaveTypeName) || activeTypes[0],
    [activeTypes, selectedLeaveTypeName]
  );

  const typeBalance = useMemo(() => {
    if (!balanceRecord || !balanceRecord.balances[selectedLeaveTypeName]) {
      const defaultQuota = selectedTypeObj?.defaultDays || 15;
      return { totalDays: defaultQuota, usedDays: 0, remainingDays: defaultQuota };
    }
    return balanceRecord.balances[selectedLeaveTypeName];
  }, [balanceRecord, selectedLeaveTypeName, selectedTypeObj]);

  // Auto-fill template when leave type or input metadata changes
  useEffect(() => {
    // Find matching template or default
    const matchedTemplate =
      templates.find((t) => t.leaveType.toLowerCase() === selectedLeaveTypeName.toLowerCase()) ||
      templates.find((t) => t.leaveType === 'Default') ||
      templates[0];

    if (!matchedTemplate) return;

    const dataObj = {
      employeeName,
      leaveType: selectedLeaveTypeName,
      startDate: startDate || '[Start Date]',
      endDate: endDate || '[End Date]',
      workingDays,
      remainingLeave: Math.max(0, typeBalance.remainingDays - workingDays),
      handoverEmployee: selectedHandoverObj ? selectedHandoverObj.name : '[Handover Employee]',
      availability
    };

    setSubject(replaceTemplatePlaceholders(matchedTemplate.subject, dataObj));
    setEmailBody(replaceTemplatePlaceholders(matchedTemplate.emailBody, dataObj));
  }, [
    selectedLeaveTypeName,
    startDate,
    endDate,
    workingDays,
    typeBalance,
    selectedHandoverObj,
    availability,
    employeeName,
    templates
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLeaveTypeName) {
      showError('Please select a valid active leave type.');
      return;
    }
    if (!startDate || !endDate) {
      showError('Please select both a Start Date and End Date.');
      return;
    }

    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    if (endObj < startObj) {
      showError('End Date cannot be earlier than Start Date.');
      return;
    }

    if (workingDays <= 0) {
      showError('Selected date range contains 0 working days (all weekend days).');
      return;
    }

    if (workingDays > typeBalance.remainingDays) {
      showError(
        `Insufficient leave balance! You requested ${workingDays} working days, but only have ${typeBalance.remainingDays} days remaining for ${selectedLeaveTypeName}.`
      );
      return;
    }

    if (!handoverEmail) {
      showError('Please select a Handover Employee who will cover your duties.');
      return;
    }

    if (!availability) {
      showError('Please select your Availability during leave.');
      return;
    }

    if (!subject.trim() || !emailBody.trim()) {
      showError('Subject and Email Body cannot be empty.');
      return;
    }

    setIsSubmitting(true);

    const handoverObj = availableHandoverEmployees.find((e) => e.email === handoverEmail);
    const handoverName = handoverObj ? handoverObj.name : 'Team Member';

    // Build new request
    const newReqId = `LV-${Math.floor(1000 + Math.random() * 9000)}`;

    // Is Team Lead submitting? Direct route to HR
    const isEmpTeamLead = isTeamLead || employeeEmail.includes('lead') || department.includes('Lead');
    const initialStatus = 'Pending';

    const newRequest = {
      id: newReqId,
      employeeName,
      employeeEmail,
      department,
      leaveType: selectedLeaveTypeName,
      startDate,
      endDate,
      workingDays,
      handoverEmployeeName: handoverName,
      handoverEmployeeEmail: handoverEmail,
      availability,
      subject: subject.trim(),
      emailBody: emailBody.trim(),
      attachmentName: attachmentName || undefined,
      status: 'Pending' as const,
      submittedDate: new Date().toISOString().split('T')[0],
      routedToHR: isEmpTeamLead
    };

    const existingRequests = getLeaveRequests();
    saveLeaveRequests([newRequest, ...existingRequests]);

    // Audit Log
    addLeaveAuditLog(
      `${employeeName} (${department})`,
      'Submitted Leave Request Email',
      newReqId,
      `${selectedLeaveTypeName} for ${workingDays} working days (${startDate} to ${endDate}). Handover: ${handoverName}.`
    );

    // Notifications
    if (isEmpTeamLead) {
      // Team Lead Leave -> Route directly to HR
      dispatchLeaveNotification(
        'grace.hr@prokip.com',
        'HR',
        `Team Lead Leave Application: ${employeeName}`,
        `Team Lead ${employeeName} has submitted a leave application for ${selectedLeaveTypeName} (${workingDays} working days). Direct HR approval required.`,
        'warning'
      );
    } else {
      // Standard Employee Leave -> Notify Team Lead & HR
      dispatchLeaveNotification(
        'adaeze@prokip.com',
        'Team Lead',
        `New Leave Request: ${employeeName}`,
        `${employeeName} from ${department} has requested ${selectedLeaveTypeName} (${workingDays} working days). Handover assigned to ${handoverName}.`,
        'info'
      );
      dispatchLeaveNotification(
        'grace.hr@prokip.com',
        'HR',
        `New Leave Request Submitted: ${employeeName}`,
        `${employeeName} requested ${selectedLeaveTypeName} (${workingDays} working days, ${startDate} to ${endDate}).`,
        'info'
      );
    }

    showSuccess(`Leave Request ${newReqId} sent successfully via Email Composer!`);
    setIsSubmitting(false);

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-4xl mx-auto animate-fade-in">
      {/* Email Composer Window Top Header */}
      <div className="bg-[#02275A] text-white px-6 py-4 flex items-center justify-between border-b border-blue-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
            <i className="fas fa-paper-plane text-sm"></i>
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide">Compose Leave Request Email</h3>
            <p className="text-[11px] text-blue-200">
              Structured Email Client • Pre-populates leave template & calculates working days
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-slate-50/50">
        {/* Top Metadata Grid */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* From (Requester Info) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                From (Employee)
              </label>
              <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-[#02275A]">
                <i className="fas fa-user-circle text-slate-400 text-sm"></i>
                <span className="truncate">
                  {employeeName} &lt;{employeeEmail}&gt; ({department})
                </span>
              </div>
            </div>

            {/* Leave Type Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Select Leave Type *
              </label>
              <select
                value={selectedLeaveTypeName}
                onChange={(e) => setSelectedLeaveTypeName(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-[#02275A] focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]"
              >
                {activeTypes.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} ({t.defaultDays} Days Quota)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Leave Balance Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#02275A] text-amber-400 flex items-center justify-center text-sm font-bold shadow-xs">
                <i className="fas fa-wallet"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {selectedLeaveTypeName} Balance
                </p>
                <p className="text-sm font-extrabold text-[#02275A]">
                  <span className="text-emerald-600 font-black">{typeBalance.remainingDays}</span> of{' '}
                  {typeBalance.totalDays} Days Remaining
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-white border border-blue-200 rounded-lg text-xs font-bold text-slate-700 shadow-2xs">
                {typeBalance.usedDays} Days Used This Cycle
              </span>
            </div>
          </div>

          {/* Dates & Working Days Calculation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-[#02275A] focus:outline-none focus:border-[#02275A]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-[#02275A] focus:outline-none focus:border-[#02275A]"
                required
              />
            </div>

            {/* Auto Calculated Working Days Badge */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Working Days Requested
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg font-black text-[#02275A]">{workingDays} Days</span>
                <span className="text-[10px] font-semibold text-slate-400">
                  (Mon–Fri, Weekends Excluded)
                </span>
              </div>
            </div>
          </div>

          {/* Handover Employee & Availability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Handover Employee *
              </label>
              <select
                value={handoverEmail}
                onChange={(e) => setHandoverEmail(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-[#02275A] focus:outline-none focus:border-[#02275A]"
                required
              >
                <option value="">-- Select Employee to Handle Duties --</option>
                {availableHandoverEmployees.map((emp) => (
                  <option key={emp.id} value={emp.email}>
                    {emp.name} ({emp.department} - {emp.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Availability During Leave *
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-[#02275A] focus:outline-none focus:border-[#02275A]"
                required
              >
                <option value="Reachable by Phone">Reachable by Phone</option>
                <option value="Reachable by Email">Reachable by Email</option>
                <option value="Reachable if Urgent">Reachable if Urgent</option>
                <option value="Not Reachable">Not Reachable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Email Subject & Body (Rich Composer View) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-extrabold text-[#02275A] flex items-center gap-2">
              <i className="fas fa-envelope-open-text text-amber-500"></i> Generated Leave Email
            </span>
            <span className="text-[10px] text-slate-400 italic">
              Auto-populated using template placeholders. You may edit before sending.
            </span>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2.5 bg-slate-50/50 border border-slate-300 rounded-xl text-xs font-bold text-[#02275A] focus:bg-white focus:outline-none focus:border-[#02275A]"
              placeholder="Leave Email Subject..."
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Email Content *
            </label>
            <textarea
              rows={8}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="w-full p-3 bg-slate-50/50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:border-[#02275A]"
              placeholder="Email body text..."
              required
            ></textarea>
          </div>

          {/* Optional Attachment */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-2 border border-slate-200">
                <i className="fas fa-paperclip text-slate-500"></i>
                <span>Attach Document (Medical Report / Exam Slip)</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                />
              </label>
              {attachmentName && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <i className="fas fa-check-circle text-emerald-500"></i> {attachmentName}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">Optional (Max 5MB)</p>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div className="flex items-center justify-between pt-2">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
          ) : (
            <div></div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#02275A] hover:bg-opacity-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <i className="fas fa-paper-plane text-amber-400"></i>
            <span>Send Leave Request Email</span>
          </button>
        </div>
      </form>
    </div>
  );
};
