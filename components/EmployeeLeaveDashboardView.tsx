import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAlert } from '../contexts/AlertContext';
import { LeaveEmailComposer } from './LeaveEmailComposer';
import { UpcomingHolidaysWidget } from './UpcomingHolidaysWidget';
import { EmployeePublicHolidayCalendarView } from './EmployeePublicHolidayCalendarView';
import {
  LeaveType,
  LeaveRequestRecord,
  EmployeeLeaveBalance,
  getLeaveTypes,
  getLeaveRequests,
  getSingleEmployeeBalanceRecord
} from './leaveUtils';

interface EmployeeLeaveDashboardViewProps {
  employeeName?: string;
  employeeEmail?: string;
  department?: string;
  isTeamLead?: boolean;
}

export const EmployeeLeaveDashboardView: React.FC<EmployeeLeaveDashboardViewProps> = ({
  employeeName = 'Test Member',
  employeeEmail = 'user@prokip.africa',
  department = 'Sales',
  isTeamLead = false
}) => {
  const { showSuccess, showError } = useAlert();

  const [activeViewMode, setActiveViewMode] = useState<'dashboard' | 'composer' | 'holidays'>('dashboard');
  const [requests, setRequests] = useState<LeaveRequestRecord[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [balanceRecord, setBalanceRecord] = useState<EmployeeLeaveBalance | null>(null);
  const [historyFilterType, setHistoryFilterType] = useState<string>('All');
  const [historyFilterStatus, setHistoryFilterStatus] = useState<string>('All');

  // Load latest data from localStorage
  const refreshData = useCallback(() => {
    const types = getLeaveTypes();
    const activeOnly = types.filter((t) => t.status === 'Active');
    setLeaveTypes(activeOnly);

    const reqs = getLeaveRequests();
    const myReqs = reqs.filter((r) => r.employeeEmail.toLowerCase() === employeeEmail.toLowerCase());
    setRequests(myReqs);

    const bal = getSingleEmployeeBalanceRecord(employeeEmail, employeeName, department, isTeamLead);
    setBalanceRecord(bal);
  }, [employeeEmail, employeeName, department, isTeamLead]);

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener('leaveDataUpdated', handleUpdate);
    return () => window.removeEventListener('leaveDataUpdated', handleUpdate);
  }, [refreshData]);

  // Filtered History
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchType = historyFilterType === 'All' || r.leaveType === historyFilterType;
      const matchStatus = historyFilterStatus === 'All' || r.status === historyFilterStatus;
      return matchType && matchStatus;
    });
  }, [requests, historyFilterType, historyFilterStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full uppercase tracking-wider">
            <i className="fas fa-check-circle text-xs"></i> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 rounded-full uppercase tracking-wider">
            <i className="fas fa-times-circle text-xs"></i> Rejected
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold text-slate-600 bg-slate-100 border border-slate-300 rounded-full uppercase tracking-wider">
            <i className="fas fa-ban text-xs"></i> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 rounded-full uppercase tracking-wider">
            <i className="fas fa-clock text-xs"></i> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#02275A] to-blue-900 text-white rounded-2xl p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 text-2xl shadow-inner">
            <i className="fas fa-umbrella-beach"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight">Employee Leave Dashboard</h2>
              {isTeamLead && (
                <span className="px-2.5 py-0.5 bg-amber-400 text-[#02275A] font-extrabold text-[10px] rounded-full uppercase">
                  Team Lead
                </span>
              )}
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Track live leave quotas, calculate working days automatically, and compose email leave requests.
            </p>
          </div>
        </div>

        {/* Quick Actions Header Buttons */}
        <div className="flex items-center gap-3">
          {activeViewMode === 'dashboard' ? (
            <>
              <button
                onClick={() => setActiveViewMode('holidays')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <i className="fas fa-calendar-alt text-amber-400"></i> Public Holidays
              </button>

              <button
                onClick={() => setActiveViewMode('composer')}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#02275A] font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <i className="fas fa-paper-plane"></i> Apply for Leave
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveViewMode('dashboard')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <i className="fas fa-arrow-left"></i> Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {activeViewMode === 'composer' ? (
        <LeaveEmailComposer
          employeeName={employeeName}
          employeeEmail={employeeEmail}
          department={department}
          isTeamLead={isTeamLead}
          onSuccess={() => {
            refreshData();
            setActiveViewMode('dashboard');
          }}
          onCancel={() => setActiveViewMode('dashboard')}
        />
      ) : activeViewMode === 'holidays' ? (
        <EmployeePublicHolidayCalendarView onBack={() => setActiveViewMode('dashboard')} />
      ) : (
        <>
          {/* SECTION 1: LEAVE BALANCE CARDS (Card for EVERY assigned leave type) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#02275A] flex items-center gap-2">
                  <i className="fas fa-wallet text-amber-500"></i> Leave Balances ({leaveTypes.length} Active Quotas)
                </h3>
                <p className="text-xs text-slate-500">
                  Balances automatically update upon request approval by Manager or HR.
                </p>
              </div>
              <button
                onClick={() => setActiveViewMode('composer')}
                className="text-xs font-bold text-[#02275A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Quick Apply</span> <i className="fas fa-chevron-right text-[10px]"></i>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {leaveTypes.map((type) => {
                const bal = balanceRecord?.balances[type.name] || {
                  totalDays: type.defaultDays,
                  usedDays: 0,
                  remainingDays: type.defaultDays
                };

                const percentageRemaining = Math.round((bal.remainingDays / (bal.totalDays || 1)) * 100);

                return (
                  <div
                    key={type.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-extrabold text-sm text-[#02275A] group-hover:text-blue-600 transition-colors">
                          {type.name}
                        </span>
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {type.defaultDays} Days Total
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between mb-2">
                        <div className="text-2xl font-black text-[#02275A]">
                          {bal.remainingDays}{' '}
                          <span className="text-xs font-semibold text-slate-400">Days Remaining</span>
                        </div>
                        <span className="text-xs font-bold text-slate-500">{bal.usedDays} Used</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                        <div
                          className={`h-full transition-all duration-500 ${
                            percentageRemaining > 50
                              ? 'bg-emerald-500'
                              : percentageRemaining > 20
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, percentageRemaining))}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Status: Active</span>
                      <button
                        onClick={() => setActiveViewMode('composer')}
                        className="font-bold text-blue-600 hover:text-[#02275A] flex items-center gap-1 cursor-pointer"
                      >
                        Request <i className="fas fa-plus-circle text-[10px]"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* UPCOMING PUBLIC HOLIDAYS WIDGET */}
          <UpcomingHolidaysWidget onViewAll={() => setActiveViewMode('holidays')} maxCount={4} />

          {/* QUICK ACTIONS BANNER */}
          <div className="bg-slate-100/80 p-4 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-[#02275A] flex items-center justify-center text-lg font-bold shadow-2xs">
                <i className="fas fa-[#02275A] fa-[#02275A]"></i>
                <i className="fas fa-bolt text-amber-500"></i>
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-[#02275A]">Quick Actions</h4>
                <p className="text-[11px] text-slate-500">Submit new leave email or review request history below</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveViewMode('composer')}
                className="px-4 py-2 bg-[#02275A] hover:bg-opacity-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fas fa-plus"></i> Apply for Leave
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('leave-history-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fas fa-history text-slate-500"></i> View Leave History
              </button>
            </div>
          </div>

          {/* SECTION 2: LEAVE HISTORY TABLE */}
          <div id="leave-history-section" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
            {/* Header & Filters */}
            <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
              <div>
                <h3 className="font-extrabold text-sm text-[#02275A] flex items-center gap-2">
                  <i className="fas fa-history text-blue-600"></i> My Leave History
                </h3>
                <p className="text-xs text-slate-500">
                  Total submitted requests: {requests.length}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Leave Type Filter */}
                <div>
                  <select
                    value={historyFilterType}
                    onChange={(e) => setHistoryFilterType(e.target.value)}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#02275A]"
                  >
                    <option value="All">All Leave Types</option>
                    {leaveTypes.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={historyFilterStatus}
                    onChange={(e) => setHistoryFilterStatus(e.target.value)}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#02275A]"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center bg-slate-50/30">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-xl mb-3">
                  <i className="fas fa-folder-open"></i>
                </div>
                <h4 className="font-bold text-slate-700 text-sm mb-1">No Leave Requests Found</h4>
                <p className="text-xs text-slate-400 mb-4">
                  You have not submitted any leave requests matching the selected filters.
                </p>
                <button
                  onClick={() => setActiveViewMode('composer')}
                  className="px-4 py-2 bg-[#02275A] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-opacity-95 transition-all"
                >
                  <i className="fas fa-paper-plane mr-1.5"></i> Apply for Leave Now
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Request ID</th>
                      <th className="py-3 px-4">Leave Type</th>
                      <th className="py-3 px-4">Leave Period</th>
                      <th className="py-3 px-4 text-center">Working Days</th>
                      <th className="py-3 px-4">Handover Staff</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Submitted Date</th>
                      <th className="py-3 px-4">Approved By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-extrabold text-[#02275A]">{req.id}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{req.leaveType}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-600 whitespace-nowrap">
                          {req.startDate} to {req.endDate}
                        </td>
                        <td className="py-3.5 px-4 text-center font-black text-[#02275A]">
                          <span className="inline-block px-2.5 py-0.5 bg-blue-50 border border-blue-200 rounded-md">
                            {req.workingDays} Days
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {req.handoverEmployeeName || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4">{getStatusBadge(req.status)}</td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{req.submittedDate}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {req.approver ? (
                            <span className="font-bold text-slate-800">{req.approver}</span>
                          ) : (
                            <span className="text-slate-400 italic">Pending Approval</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
