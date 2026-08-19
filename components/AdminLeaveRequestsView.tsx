import React from 'react';
import { HRLeaveManagementView } from './HRLeaveManagementView';

export interface LeaveTypeConfig {
  id: string;
  name: string;
  code: string;
  defaultDays: number;
  paid: boolean;
  requiresAttachment: boolean;
  maxConsecutiveDays: number;
  noticePeriodDays: number;
  accrualFrequency: 'Monthly' | 'Annually' | 'Immediate';
  carryForwardAllowed: boolean;
  maxCarryDays: number;
  allowHalfDay: boolean;
  color: string;
}

export interface EmployeeBalance {
  employeeEmail: string;
  employeeName: string;
  department: string;
  annualTotal: number;
  annualUsed: number;
  annualPending: number;
  sickTotal: number;
  sickUsed: number;
  sickPending: number;
  casualTotal: number;
  casualUsed: number;
  maternityTotal: number;
  maternityUsed: number;
  carriedOver: number;
}

export interface CompanyHoliday {
  id: string;
  name: string;
  date: string;
  recurring: boolean;
  department: string;
}

export interface LeaveAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  requestId: string;
  details: string;
}

export const AdminLeaveRequestsView: React.FC<{ userDepartment?: string }> = ({ userDepartment }) => {
  return <HRLeaveManagementView userDepartment={userDepartment} />;
};
