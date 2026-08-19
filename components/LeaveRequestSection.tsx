import React from 'react';
import { EmployeeLeaveDashboardView } from './EmployeeLeaveDashboardView';

export interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  status: 'Draft' | 'Pending Manager' | 'Pending HR' | 'Pending Manager Approval' | 'Pending HR Approval' | 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Recalled';
  createdAt: string;
  rejectionComment?: string;
  isHalfDay?: boolean;
  halfDaySession?: 'Morning' | 'Afternoon';
  durationDays?: number;
  attachmentName?: string;
  attachmentUrl?: string;
  managerApproval?: 'Approved' | 'Rejected' | 'Pending';
  hrApproval?: 'Approved' | 'Rejected' | 'Pending';
  managerApprovedBy?: string;
  managerApprovedAt?: string;
  managerComment?: string;
  hrApprovedBy?: string;
  hrApprovedAt?: string;
  hrComment?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  recalledBy?: string;
  recalledAt?: string;
}

interface LeaveRequestSectionProps {
  defaultName?: string;
  defaultEmail?: string;
  defaultDept?: string;
  isTeamLead?: boolean;
}

export const LeaveRequestSection: React.FC<LeaveRequestSectionProps> = ({
  defaultName = "Test Member",
  defaultEmail = "user@prokip.africa",
  defaultDept = "Sales",
  isTeamLead = false
}) => {
  return (
    <EmployeeLeaveDashboardView
      employeeName={defaultName}
      employeeEmail={defaultEmail}
      department={defaultDept}
      isTeamLead={isTeamLead}
    />
  );
};

