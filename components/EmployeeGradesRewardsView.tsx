import React, { useState, useMemo, useEffect } from "react";
import { initialEmployees, normalizeEmployeesList } from "./AdminHRCenterView";

interface EmployeeGradesRewardsViewProps {
  hideRewards?: boolean;
  userRole?: string;
}

interface RewardTypeOption {
  type: string;
  points: number;
}

interface EngineeringPenaltyOption {
  id: string;
  name: string;
  points: number;
}

interface RewardRecord {
  id: string;
  employee_id: string;
  period_id: string;
  reward_type: string;
  points: number;
  reason: string;
  source: string;
  related_record_id: string;
  created_by: string;
  created_at: string;
}

const EmployeeGradesRewardsView: React.FC<EmployeeGradesRewardsViewProps> = ({ hideRewards, userRole }) => {
  // Determine if user has editing rights
  const canEdit = useMemo(() => {
    if (userRole === "employee" || userRole === "call-agent" || userRole === "agent" || userRole === "support-staff") {
      return false;
    }
    return true;
  }, [userRole]);
  // 1. Employees data
  const [employees, setEmployees] = useState<any[]>(() => {
    const saved = localStorage.getItem("company_employees_data");
    let loadedList: any[] = [];
    if (saved) {
      try {
        loadedList = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse company_employees_data", e);
      }
    }
    if (loadedList.length === 0) {
      loadedList = initialEmployees;
    }
    return normalizeEmployeesList(loadedList);
  });

  // 2. Company Rewards (History Log)
  const [companyRewards, setCompanyRewards] = useState<RewardRecord[]>(() => {
    const saved = localStorage.getItem("company_rewards_history_list");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved rewards", e);
      }
    }
    return [
      {
        id: "RWD-2026-001",
        employee_id: "1",
        period_id: "Q2 2026",
        reward_type: "closed_big_deal",
        points: 80,
        reason: "Successfully closed a high-tier corporate contract with Sokoto Rice Mill.",
        source: "Sales Pipeline Oversight",
        related_record_id: "Sokoto-9921",
        created_by: "Admin",
        created_at: "2026-06-01T10:30:00.000Z",
      },
      {
        id: "RWD-2026-002",
        employee_id: "2",
        period_id: "Q2 2026",
        reward_type: "helped_teammate",
        points: 25,
        reason: "Onboarded 3 new junior agents and shared prospecting scripts.",
        source: "Manager Recommendation",
        related_record_id: "COLL-8842",
        created_by: "Admin",
        created_at: "2026-06-05T14:15:00.000Z",
      },
      {
        id: "RWD-2026-003",
        employee_id: "3",
        period_id: "Q2 2026",
        reward_type: "perfect_csat",
        points: 50,
        reason: "Scored 100% CSAT on 15 concurrent tickets regarding system migration.",
        source: "System Analytics",
        related_record_id: "CSAT-11202",
        created_by: "Admin",
        created_at: "2026-06-10T09:00:00.000Z",
      },
      {
        id: "RWD-2026-004",
        employee_id: "4",
        period_id: "Q2 2026",
        reward_type: "customer_praise",
        points: 30,
        reason: "Received stellar email praise from Accra Tech Hub director.",
        source: "Customer Relations",
        related_record_id: "GH-001",
        created_by: "Admin",
        created_at: "2026-06-14T11:45:00.000Z",
      },
    ];
  });

  const currentEmployee = useMemo(() => {
    let loggedInEmail = localStorage.getItem('logged_in_email') || 'employee@gmail.com';

    if (loggedInEmail === 'marketer@gmail.com' || loggedInEmail === 'marketer') {
      loggedInEmail = 'marketer@gmail.com';
    } else if (loggedInEmail === 'customersuccess@gmail.com') {
      loggedInEmail = 'customersuccess@gmail.com';
    } else if (loggedInEmail === 'callagent@gmail.com') {
      loggedInEmail = 'b.danladi@company.com';
    }

    const isTeamLead = userRole === 'team-lead' || ['cx-head', 'customer-success', 'sales-manager', 'marketing-manager', 'support-staff', 'finance', 'content-lead', 'engineering', 'engineer'].includes(userRole || '') || ['teamlead@gmail.com', 'cx@gmail.com', 'salesmanager@gmail.com', 'support@gmail.com', 'finance@gmail.com', 'marketing@gmail.com', 'content@gmail.com', 'customersuccess@gmail.com'].includes(loggedInEmail);
    if (userRole === 'call-agent' || loggedInEmail === 'callagent@gmail.com') {
      loggedInEmail = 'b.danladi@company.com';
    } else if (isTeamLead && !['marketing@gmail.com', 'support@gmail.com', 'customersuccess@gmail.com'].includes(loggedInEmail)) {
      loggedInEmail = 's.ojo@company.com';
    }
    const userEmp = employees.find(e => e.email === loggedInEmail);
    if (userEmp) return userEmp;
    const nonLeadEmp = employees.find(e => !e.is_team_lead);
    if (nonLeadEmp) return nonLeadEmp;
    return employees[0] || null;
  }, [employees, userRole]);

  const displayedRewards = useMemo(() => {
    if (userRole === "admin" || userRole === "manager") {
      return companyRewards;
    }
    if (!currentEmployee) {
      return [];
    }
    return companyRewards.filter((r) => String(r.employee_id) === String(currentEmployee.id));
  }, [companyRewards, userRole, currentEmployee]);

  // 3. Reward Types
  const [rewardTypesList, setRewardTypesList] = useState<RewardTypeOption[]>(() => {
    const saved = localStorage.getItem("company_reward_types_list_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved reward types", e);
      }
    }
    return [
      { type: "customer_praise", points: 50 },
      { type: "innovation", points: 60 },
      { type: "helped_teammate", points: 25 },
      { type: "excellent_delivery", points: 40 },
      { type: "perfect_csat", points: 50 },
      { type: "closed_big_deal", points: 80 },
    ];
  });

  // 4. Engineering Penalties
  const [engineeringPenaltiesList, setEngineeringPenaltiesList] = useState<EngineeringPenaltyOption[]>(() => {
    const saved = localStorage.getItem("engineering_penalties_list_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse engineering penalties", e);
      }
    }
    return [
      { id: "pnl-1", name: "SLA Breach - Critical Bug", points: 15 },
      { id: "pnl-2", name: "Late Deployment - Staging", points: 10 },
      { id: "pnl-3", name: "Failed Quality gate / Broke Build", points: 20 },
      { id: "pnl-4", name: "Documentation Deficit", points: 5 },
      { id: "pnl-5", name: "Sprint Commitment Spillover", points: 10 },
    ];
  });

  const filteredRewardTypes = useMemo(() => {
    if (userRole === "admin" || userRole === "manager") {
      return rewardTypesList;
    }
    if (!currentEmployee) {
      return rewardTypesList;
    }
    const dept = (currentEmployee.department || "").toLowerCase();
    const role = (currentEmployee.role || "").toLowerCase();

    return rewardTypesList.filter(item => {
      const type = item.type.toLowerCase();
      if (type === "helped_teammate") return true;

      if (dept.includes("sales") || role.includes("sales") || role.includes("deal")) {
        return ["closed_big_deal", "innovation"].includes(type);
      }
      if (dept.includes("customer") || dept.includes("cx") || dept.includes("support") || role.includes("support") || role.includes("customer")) {
        return ["customer_praise", "perfect_csat"].includes(type);
      }
      if (dept.includes("engineering") || role.includes("engineer") || role.includes("developer") || dept.includes("it")) {
        return ["innovation", "excellent_delivery"].includes(type);
      }
      return ["innovation", "customer_praise", "helped_teammate"].includes(type);
    });
  }, [rewardTypesList, currentEmployee, userRole]);

  const filteredPenalties = useMemo(() => {
    if (userRole === "admin" || userRole === "manager") {
      return engineeringPenaltiesList;
    }
    if (!currentEmployee) {
      return engineeringPenaltiesList;
    }
    const dept = (currentEmployee.department || "").toLowerCase();
    const role = (currentEmployee.role || "").toLowerCase();

    const isEng = dept.includes("engineering") || role.includes("engineer") || role.includes("developer") || dept.includes("it");

    return engineeringPenaltiesList.filter(item => {
      const name = item.name.toLowerCase();
      if (isEng) {
        return true;
      }
      return !name.includes("sla breach") && !name.includes("deployment") && !name.includes("quality gate") && !name.includes("build") && !name.includes("sprint");
    });
  }, [engineeringPenaltiesList, currentEmployee, userRole]);

  // Interactive inline states for modifications (identical in style to the admin panel with synced data)
  const [newRewardTypeInput, setNewRewardTypeInput] = useState("");
  const [newRewardTypePoints, setNewRewardTypePoints] = useState(30);
  const [editingRewardTypeIdx, setEditingRewardTypeIdx] = useState(-1);
  const [editingRewardTypeVal, setEditingRewardTypeVal] = useState("");
  const [editingRewardTypePoints, setEditingRewardTypePoints] = useState(30);

  const [newPenaltyInput, setNewPenaltyInput] = useState("");
  const [newPenaltyPoints, setNewPenaltyPoints] = useState(10);
  const [editingPenaltyIdx, setEditingPenaltyIdx] = useState(-1);
  const [editingPenaltyVal, setEditingPenaltyVal] = useState("");
  const [editingPenaltyPoints, setEditingPenaltyPoints] = useState(10);

  // Quick modals feedback toasts
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync back to local storage whenever a state updates
  const saveRewardTypes = (updated: RewardTypeOption[]) => {
    setRewardTypesList(updated);
    localStorage.setItem("company_reward_types_list_v2", JSON.stringify(updated));
  };

  const savePenalties = (updated: EngineeringPenaltyOption[]) => {
    setEngineeringPenaltiesList(updated);
    localStorage.setItem("engineering_penalties_list_v1", JSON.stringify(updated));
  };

  const saveRewards = (updated: RewardRecord[]) => {
    setCompanyRewards(updated);
    localStorage.setItem("company_rewards_history_list", JSON.stringify(updated));
  };

  // Handlers for Reward Types editing
  const handleAddRewardType = () => {
    const trimmed = newRewardTypeInput.trim();
    if (!trimmed) {
      showToast("Reward type name cannot be empty", "error");
      return;
    }
    if (rewardTypesList.some((r) => r.type.toLowerCase() === trimmed.toLowerCase())) {
      showToast("This reward type already exists", "error");
      return;
    }
    const updated = [...rewardTypesList, { type: trimmed, points: newRewardTypePoints }];
    saveRewardTypes(updated);
    setNewRewardTypeInput("");
    setNewRewardTypePoints(30);
    showToast("Added reward type option successfully.");
  };

  const handleDeleteRewardType = (idxOnList: number, typeName: string) => {
    if (rewardTypesList.length <= 1) {
      showToast("At least one reward type must remain", "error");
      return;
    }
    const updated = rewardTypesList.filter((_, idx) => idx !== idxOnList);
    saveRewardTypes(updated);
    showToast(`Removed "${typeName}" options successfully.`);
  };

  // Handlers for Penalties editing
  const handleAddPenalty = () => {
    const trimmed = newPenaltyInput.trim();
    if (!trimmed) {
      showToast("Penalty policy description cannot be empty", "error");
      return;
    }
    const exists = engineeringPenaltiesList.some((item) => item.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      showToast("This penalty policy already exists.", "error");
      return;
    }
    const updated = [
      ...engineeringPenaltiesList,
      { id: "pnl-" + Date.now(), name: trimmed, points: newPenaltyPoints },
    ];
    savePenalties(updated);
    setNewPenaltyInput("");
    setNewPenaltyPoints(10);
    showToast("Added new penalty rule successfully.");
  };

  const handleDeletePenalty = (idx: number, name: string) => {
    const updated = engineeringPenaltiesList.filter((_, i) => i !== idx);
    savePenalties(updated);
    showToast(`Deleted memory of penalty "${name}".`);
  };

  // Actions on individual logged rewards
  const handleDeleteRewardRecord = (id: string) => {
    const recordToDelete = companyRewards.find((r) => r.id === id);
    if (!recordToDelete) return;
    const updated = companyRewards.filter((r) => r.id !== id);
    saveRewards(updated);

    // Sync specific employee points back where possible
    const empIdx = employees.findIndex((e) => e.id === recordToDelete.employee_id);
    if (empIdx !== -1) {
      const updatedEmps = [...employees];
      const ptsToAdjust = recordToDelete.points;
      updatedEmps[empIdx] = {
        ...updatedEmps[empIdx],
        rewardPoints: Math.max(0, (updatedEmps[empIdx].rewardPoints ?? 100) - ptsToAdjust),
      };
      setEmployees(updatedEmps);
      localStorage.setItem("company_employees_data", JSON.stringify(updatedEmps));
    }
    showToast(`Revoked reward ID "${id}" and recalculated points balance.`);
  };

  return (
    <div id="rewards-recognition-view" className="p-6 space-y-6 animate-fade-in font-sans">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-3 transition-all ${
            toastMessage.type === "error"
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          <i className={toastMessage.type === "error" ? "fas fa-exclamation-circle" : "fas fa-check-circle"}></i>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Primary Header Segment */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-[#02275A] text-lg font-black flex items-center gap-2">
            <i className="fas fa-trophy text-[#EAB308]"></i> Rewards & Special Recognition
          </h2>
        </div>
      </div>

      {/* Reward Types and Penalties Management Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Reward types edit and listing */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#02275A]">Default Reward Types</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Edit existing rules or point assignments</p>
              </div>
              <i className="fas fa-sliders-h text-slate-400 text-sm"></i>
            </div>

            <div className="space-y-2">
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto bg-slate-50/20">
                {filteredRewardTypes.map((item, idx) => {
                  const isEditing = editingRewardTypeIdx === idx;
                  return (
                    <div key={item.type} className="p-3 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
                      {isEditing ? (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                          <input
                            type="text"
                            value={editingRewardTypeVal}
                            onChange={(e) => setEditingRewardTypeVal(e.target.value)}
                            className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs font-semibold font-mono text-slate-800"
                          />
                          <input
                            type="number"
                            value={editingRewardTypePoints}
                            onChange={(e) => setEditingRewardTypePoints(Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-slate-300 rounded text-xs font-semibold font-mono text-slate-800"
                            placeholder="Pts"
                          />
                          <div className="flex gap-1 justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const trimmed = editingRewardTypeVal.trim();
                                if (!trimmed) return;
                                const updatedList = [...rewardTypesList];
                                const originalIdx = rewardTypesList.findIndex(r => r.type === item.type);
                                if (originalIdx !== -1) {
                                  updatedList[originalIdx] = { type: trimmed, points: editingRewardTypePoints };
                                  saveRewardTypes(updatedList);
                                }
                                setEditingRewardTypeIdx(-1);
                                showToast("Updated reward type successfully.");
                              }}
                              className="p-1 px-2.5 bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRewardTypeIdx(-1)}
                              className="p-1 px-2 bg-slate-200 text-slate-600 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-700 bg-white border border-slate-100 rounded-md px-2 py-1 font-semibold shadow-xs capitalize">
                              {item.type.replace(/_/g, " ")}
                            </span>
                            <span className="font-mono text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                              +{item.points} pts
                            </span>
                          </div>
                          
                          {canEdit && (
                            <div className="flex items-center gap-1.5 font-sans">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingRewardTypeIdx(idx);
                                  setEditingRewardTypeVal(item.type);
                                  setEditingRewardTypePoints(item.points);
                                }}
                                className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer text-xs"
                                title="Edit type"
                              >
                                <i className="fas fa-edit text-[10px]"></i>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick add reward type form */}
            {canEdit && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <p className="text-[10px] text-[#02275A] font-extrabold uppercase tracking-wide">Add Custom Reward Type Option</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. peer_commendation"
                    value={newRewardTypeInput}
                    onChange={(e) => setNewRewardTypeInput(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#02275A]"
                  />
                  <input
                    type="number"
                    placeholder="Pts"
                    value={newRewardTypePoints}
                    onChange={(e) => setNewRewardTypePoints(parseInt(e.target.value) || 30)}
                    className="w-16 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#02275A] text-center"
                  />
                  <button
                    onClick={handleAddRewardType}
                    className="bg-[#02275A] text-white px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-blue-900 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Penalties list and management rules */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#02275A]">Penalties</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Define & Edit Deductions (Engineering/Conduct)</p>
              </div>
              <i className="fas fa-exclamation-triangle text-rose-500 text-sm"></i>
            </div>

            <div className="space-y-2">
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto bg-slate-50/20">
                {filteredPenalties.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 italic font-bold text-xs">No penalties defined yet. Add one below!</div>
                ) : (
                  filteredPenalties.map((item, idx) => {
                    const isEditing = editingPenaltyIdx === idx;
                    return (
                      <div key={item.id} className="p-3 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
                        {isEditing ? (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                            <input
                              type="text"
                              value={editingPenaltyVal}
                              onChange={(e) => setEditingPenaltyVal(e.target.value)}
                              className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs font-semibold font-mono text-slate-800"
                            />
                            <input
                              type="number"
                              value={editingPenaltyPoints}
                              onChange={(e) => setEditingPenaltyPoints(Number(e.target.value))}
                              className="w-20 px-2 py-1 border border-slate-300 rounded text-xs font-semibold font-mono text-slate-800"
                              placeholder="Pts"
                            />
                            <div className="flex gap-1 justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  const trimmed = editingPenaltyVal.trim();
                                  if (!trimmed) return;
                                  const updatedList = [...engineeringPenaltiesList];
                                  const originalIdx = engineeringPenaltiesList.findIndex(p => p.id === item.id);
                                  if (originalIdx !== -1) {
                                    updatedList[originalIdx] = { id: item.id, name: trimmed, points: editingPenaltyPoints };
                                    savePenalties(updatedList);
                                  }
                                  setEditingPenaltyIdx(-1);
                                  showToast("Updated penalty policy successfully.");
                                }}
                                className="p-1 px-2.5 bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingPenaltyIdx(-1)}
                                className="p-1 px-2 bg-slate-200 text-slate-600 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-slate-700 bg-white border border-slate-100 rounded-md px-2 py-1 font-semibold shadow-xs">
                                {item.name}
                              </span>
                              <span className="font-mono text-[10px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                                -{item.points} pts
                              </span>
                            </div>
                            {canEdit && (
                              <div className="flex items-center gap-1.5 font-sans">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPenaltyIdx(idx);
                                    setEditingPenaltyVal(item.name);
                                    setEditingPenaltyPoints(item.points);
                                  }}
                                  className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer text-xs"
                                  title="Edit penalty"
                                >
                                  <i className="fas fa-edit text-[10px]"></i>
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick add penalty option form */}
            {canEdit && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <p className="text-[10px] text-[#02275A] font-extrabold uppercase tracking-wide">Add New Penalty Policy</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Broken Build on Production"
                    value={newPenaltyInput}
                    onChange={(e) => setNewPenaltyInput(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#02275A]"
                  />
                  <input
                    type="number"
                    placeholder="Pts"
                    value={newPenaltyPoints}
                    onChange={(e) => setNewPenaltyPoints(Math.max(1, parseInt(e.target.value) || 10))}
                    className="w-16 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#02275A] text-center"
                  />
                  <button
                    onClick={handleAddPenalty}
                    className="bg-[#02275A] text-white px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-blue-900 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Rewards History Log Table - Dynamic details capturing real-time changes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="rewards-history-table">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-extrabold text-sm text-[#02275A] flex items-center gap-2">
              <i className="fas fa-table text-slate-400"></i> Rewards Table (Storage History)
            </h3>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">Capturing all issued employee rewards, period bounds, and point assignments</p>
          </div>
          <span className="text-[10px] font-bold text-[#02275A] uppercase tracking-widest font-mono bg-[#02275A]/5 border border-[#02275A]/10 px-2.5 py-1 rounded">
            {displayedRewards.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono bg-slate-50/20">
                <th className="p-4">ID</th>
                <th className="p-4">Employee</th>
                <th className="p-4">Period ID</th>
                <th className="p-4">Reward Type</th>
                <th className="p-4 text-center">Points</th>
                <th className="p-4">Reason / Notes</th>
                <th className="p-4">Source</th>
                <th className="p-4">Related ID</th>
                <th className="p-4">Created By</th>
                {canEdit && userRole !== "team-lead" && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-semibold">
              {displayedRewards.length === 0 ? (
                <tr>
                  <td colSpan={canEdit && userRole !== "team-lead" ? 10 : 9} className="p-8 text-center text-slate-400 italic font-bold">
                    No rewards have been defined yet.
                  </td>
                </tr>
              ) : (
                displayedRewards.map((r) => {
                  const emp = employees.find((e) => String(e.id) === String(r.employee_id));
                  const empName = emp ? `${emp.firstName} ${emp.lastName}` : `ID: ${r.employee_id}`;
                  const empRole = emp ? emp.role : "Staff";
                  
                  let typeStyle = "bg-slate-100 text-slate-800 border-slate-200";
                  let typeIcon = "fa-gift";
                  
                  if (r.reward_type === "customer_praise") {
                    typeStyle = "bg-purple-50 text-purple-700 border-purple-200";
                    typeIcon = "fa-comment-dots";
                  } else if (r.reward_type === "innovation") {
                    typeStyle = "bg-sky-50 text-sky-700 border-sky-200";
                    typeIcon = "fa-lightbulb";
                  } else if (r.reward_type === "helped_teammate") {
                    typeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
                    typeIcon = "fa-hands-helping";
                  } else if (r.reward_type === "excellent_delivery") {
                    typeStyle = "bg-blue-50 text-blue-700 border-blue-200";
                    typeIcon = "fa-truck-loading";
                  } else if (r.reward_type === "perfect_csat") {
                    typeStyle = "bg-rose-50 text-rose-700 border-rose-200";
                    typeIcon = "fa-star";
                  } else if (r.reward_type === "closed_big_deal") {
                    typeStyle = "bg-amber-50 text-amber-800 border-amber-200";
                    typeIcon = "fa-trophy";
                  } else if (r.reward_type === "penalty") {
                    typeStyle = "bg-rose-50 text-rose-700 border-rose-250";
                    typeIcon = "fa-exclamation-triangle";
                  }

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-400">{r.id}</td>
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900">{empName}</div>
                        <div className="text-[10px] text-slate-400 capitalize font-bold">{empRole}</div>
                      </td>
                      <td className="p-4 font-mono">{r.period_id}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 border ${typeStyle}`}>
                          <i className={`fas ${typeIcon}`}></i>
                          {r.reward_type.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {r.points < 0 ? (
                          <span className="font-mono text-xs font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                            {r.points} pts
                          </span>
                        ) : (
                          <span className="font-mono text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                            +{r.points} pts
                          </span>
                        )}
                      </td>
                      <td className="p-4 max-w-xs font-semibold text-slate-600 truncate" title={r.reason}>
                        {r.reason}
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-[10px]">{r.source}</td>
                      <td className="p-4 text-slate-500 font-mono text-[10px]">{r.related_record_id}</td>
                      <td className="p-4 text-slate-400">
                        <div>{r.created_by}</div>
                        <div className="text-[9px] font-normal">{new Date(r.created_at).toLocaleDateString()}</div>
                      </td>
                      {canEdit && userRole !== "team-lead" && (
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              if (window.confirm("Are you sure you want to revoke this reward record and deduct points?")) {
                                handleDeleteRewardRecord(r.id);
                              }
                            }}
                            className="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Revoke Reward & Deduct Points"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default EmployeeGradesRewardsView;
