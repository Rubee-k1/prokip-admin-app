import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAlert } from '../contexts/AlertContext';
import {
  PublicHoliday,
  HolidayNotificationConfig,
  getPublicHolidays,
  savePublicHolidays,
  getHolidayNotificationConfig,
  saveHolidayNotificationConfig,
  addLeaveAuditLog
} from './leaveUtils';

interface HRPublicHolidayManagementViewProps {
  actorName?: string;
}

export const HRPublicHolidayManagementView: React.FC<HRPublicHolidayManagementViewProps> = ({
  actorName = 'Grace Admin (HR)'
}) => {
  const { showSuccess, showError } = useAlert();

  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [notifConfig, setNotifConfig] = useState<HolidayNotificationConfig>({
    enabled: true,
    remind7DaysBefore: true,
    remind3DaysBefore: true,
    remind1DayBefore: true,
    inApp: true,
    email: true
  });

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals State
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<PublicHoliday | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<'National Holiday' | 'Company Holiday' | 'Regional Holiday'>('National Holiday');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [description, setDescription] = useState('');

  // Confirmation / View Modals
  const [viewModalHoliday, setViewModalHoliday] = useState<PublicHoliday | null>(null);
  const [deleteModalHoliday, setDeleteModalHoliday] = useState<PublicHoliday | null>(null);
  const [toggleModalHoliday, setToggleModalHoliday] = useState<PublicHoliday | null>(null);
  const [notifSettingsOpen, setNotifSettingsOpen] = useState(false);

  // Load Data
  const loadData = useCallback(() => {
    setHolidays(getPublicHolidays());
    setNotifConfig(getHolidayNotificationConfig());
  }, []);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('leaveDataUpdated', handleUpdate);
    return () => window.removeEventListener('leaveDataUpdated', handleUpdate);
  }, [loadData]);

  // Available Years for filter dropdown
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    holidays.forEach((h) => {
      if (h.date) {
        const y = h.date.split('-')[0];
        if (y) years.add(y);
      }
    });
    return Array.from(years).sort();
  }, [holidays]);

  // Filtered and Sorted Holidays
  const filteredHolidays = useMemo(() => {
    let result = holidays.filter((h) => {
      const matchSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.description && h.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const hYear = h.date ? h.date.split('-')[0] : '';
      const matchYear = filterYear === 'All' || hYear === filterYear;
      const matchStatus = filterStatus === 'All' || h.status === filterStatus;
      const matchCat = filterCategory === 'All' || h.category === filterCategory;
      return matchSearch && matchYear && matchStatus && matchCat;
    });

    result.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.date.localeCompare(b.date);
      } else {
        return b.date.localeCompare(a.date);
      }
    });

    return result;
  }, [holidays, searchQuery, filterYear, filterStatus, filterCategory, sortOrder]);

  // Pagination Math
  const totalPages = Math.ceil(filteredHolidays.length / itemsPerPage) || 1;
  const paginatedHolidays = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredHolidays.slice(start, start + itemsPerPage);
  }, [filteredHolidays, currentPage, itemsPerPage]);

  // Form Modal Handlers
  const handleOpenAddModal = () => {
    setEditingHoliday(null);
    setName('');
    setDate('');
    setCategory('National Holiday');
    setStatus('Active');
    setDescription('');
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (h: PublicHoliday) => {
    setEditingHoliday(h);
    setName(h.name);
    setDate(h.date);
    setCategory(h.category);
    setStatus(h.status);
    setDescription(h.description || '');
    setFormModalOpen(true);
  };

  const handleSaveHoliday = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      showError('Holiday Name is required.');
      return;
    }
    if (!date) {
      showError('Holiday Date is required.');
      return;
    }

    // Check Duplicate Name + Date
    const isDuplicate = holidays.some((h) => {
      if (editingHoliday && h.id === editingHoliday.id) return false;
      return h.name.trim().toLowerCase() === name.trim().toLowerCase() && h.date === date;
    });

    if (isDuplicate) {
      showError(`A holiday named "${name.trim()}" on date ${date} already exists.`);
      return;
    }

    let updated: PublicHoliday[];
    const todayStr = new Date().toISOString().split('T')[0];

    if (editingHoliday) {
      updated = holidays.map((h) =>
        h.id === editingHoliday.id
          ? {
              ...h,
              name: name.trim(),
              date,
              category,
              status,
              description: description.trim()
            }
          : h
      );
      savePublicHolidays(updated);
      addLeaveAuditLog(
        actorName,
        'Updated Public Holiday',
        editingHoliday.id,
        `Updated holiday "${name.trim()}" (${date}) - Category: ${category}, Status: ${status}`
      );
      showSuccess(`Public Holiday "${name.trim()}" updated successfully.`);
    } else {
      const newId = `HOL-${date.split('-')[0]}-${Math.floor(100 + Math.random() * 900)}`;
      const newHol: PublicHoliday = {
        id: newId,
        name: name.trim(),
        date,
        category,
        status,
        description: description.trim(),
        createdBy: actorName,
        createdAt: todayStr
      };
      updated = [newHol, ...holidays];
      savePublicHolidays(updated);
      addLeaveAuditLog(
        actorName,
        'Created Public Holiday',
        newId,
        `Created new public holiday "${name.trim()}" on ${date} (${category})`
      );
      showSuccess(`Public Holiday "${name.trim()}" created successfully.`);
    }

    setFormModalOpen(false);
  };

  // Toggle Active/Inactive
  const handleConfirmToggleStatus = () => {
    if (!toggleModalHoliday) return;
    const newStatus = toggleModalHoliday.status === 'Active' ? 'Inactive' : 'Active';
    const updated = holidays.map((h) =>
      h.id === toggleModalHoliday.id ? { ...h, status: newStatus as 'Active' | 'Inactive' } : h
    );
    savePublicHolidays(updated);
    addLeaveAuditLog(
      actorName,
      newStatus === 'Active' ? 'Activated Public Holiday' : 'Deactivated Public Holiday',
      toggleModalHoliday.id,
      `Changed status of "${toggleModalHoliday.name}" to ${newStatus}`
    );
    showSuccess(`Holiday "${toggleModalHoliday.name}" is now ${newStatus}.`);
    setToggleModalHoliday(null);
  };

  // Delete Holiday
  const handleConfirmDelete = () => {
    if (!deleteModalHoliday) return;
    const updated = holidays.filter((h) => h.id !== deleteModalHoliday.id);
    savePublicHolidays(updated);
    addLeaveAuditLog(
      actorName,
      'Deleted Public Holiday',
      deleteModalHoliday.id,
      `Deleted public holiday "${deleteModalHoliday.name}" (${deleteModalHoliday.date})`
    );
    showSuccess(`Public Holiday "${deleteModalHoliday.name}" deleted.`);
    setDeleteModalHoliday(null);
  };

  // Save Notification Config
  const handleSaveNotifConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveHolidayNotificationConfig(notifConfig);
    addLeaveAuditLog(
      actorName,
      'Updated Holiday Notification Settings',
      'NOTIF-CFG',
      `Updated holiday reminder rules: Enabled=${notifConfig.enabled}, 7d=${notifConfig.remind7DaysBefore}, 3d=${notifConfig.remind3DaysBefore}, 1d=${notifConfig.remind1DayBefore}`
    );
    showSuccess('Holiday Notification settings saved.');
    setNotifSettingsOpen(false);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Company Holiday':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200 rounded-md">
            <i className="fas fa-building text-[9px]"></i> Company Holiday
          </span>
        );
      case 'Regional Holiday':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md">
            <i className="fas fa-map-marker-alt text-[9px]"></i> Regional Holiday
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-md">
            <i className="fas fa-flag text-[9px]"></i> National Holiday
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Title */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-bold">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div>
              <h2 className="text-lg font-black text-[#02275A]">Public Holiday Management</h2>
              <p className="text-xs text-slate-500">
                Configure central company and public holidays visible to employees.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setNotifSettingsOpen(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <i className="fas fa-bell text-amber-500"></i> Notification Settings
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-[#02275A] hover:bg-opacity-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <i className="fas fa-plus"></i> Add Public Holiday
          </button>
        </div>
      </div>

      {/* Mandatory Notice Banner */}
      <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <i className="fas fa-info-circle text-amber-600 text-base mt-0.5"></i>
        <div>
          <strong className="font-extrabold block mb-0.5">Informational Calendar Policy</strong>
          Public holidays are maintained strictly for organizational planning and employee communication.
          <span className="font-extrabold text-amber-950"> Public holidays do NOT affect leave balances or leave day calculations.</span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <i className="fas fa-search absolute left-3.5 top-3 text-slate-400 text-xs"></i>
            <input
              type="text"
              placeholder="Search holiday name or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#02275A] transition-all"
            />
          </div>

          {/* Filter Year */}
          <div>
            <select
              value={filterYear}
              onChange={(e) => {
                setFilterYear(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#02275A]"
            >
              <option value="All">All Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Year {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#02275A]"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Filter Category */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#02275A]"
            >
              <option value="All">All Categories</option>
              <option value="National Holiday">National Holiday</option>
              <option value="Company Holiday">Company Holiday</option>
              <option value="Regional Holiday">Regional Holiday</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 text-xs text-slate-500 border-t border-slate-100">
          <span>
            Showing <strong className="text-[#02275A]">{filteredHolidays.length}</strong> configured holidays
          </span>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Sort Date:</span>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <i className={`fas fa-sort-amount-${sortOrder === 'asc' ? 'down' : 'up'}`}></i>
              {sortOrder === 'asc' ? 'Earliest First' : 'Latest First'}
            </button>
          </div>
        </div>
      </div>

      {/* Public Holiday Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredHolidays.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/50">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-xl mb-3">
              <i className="fas fa-calendar-times"></i>
            </div>
            <h4 className="font-bold text-slate-700 text-sm mb-1">No Public Holidays Found</h4>
            <p className="text-xs text-slate-400 mb-4">
              No public holidays match the current filters or search query.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-[#02275A] text-white text-xs font-bold rounded-xl hover:bg-opacity-90"
            >
              <i className="fas fa-plus mr-1.5"></i> Add New Holiday
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Holiday Name</th>
                  <th className="py-3.5 px-4">Holiday Date</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created By</th>
                  <th className="py-3.5 px-4">Date Created</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedHolidays.map((h) => {
                  const dateObj = new Date(h.date + 'T00:00:00');
                  const formattedDate = !isNaN(dateObj.getTime())
                    ? dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                    : h.date;

                  return (
                    <tr key={h.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3.5 px-4 font-extrabold text-[#02275A]">
                        <div className="flex flex-col">
                          <span>{h.name}</span>
                          {h.description && (
                            <span className="text-[11px] font-normal text-slate-400 truncate max-w-xs">
                              {h.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <i className="far fa-calendar text-blue-500"></i>
                          <span>{formattedDate}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">{getCategoryBadge(h.category)}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {h.status === 'Active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                            <i className="fas fa-circle text-[6px]"></i> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-600 bg-slate-100 border border-slate-300 rounded-full">
                            <i className="fas fa-circle text-[6px]"></i> Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold">{h.createdBy}</td>
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">{h.createdAt}</td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View */}
                          <button
                            onClick={() => setViewModalHoliday(h)}
                            title="View Details"
                            className="p-1.5 text-slate-500 hover:text-[#02275A] hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                          >
                            <i className="fas fa-eye"></i>
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditModal(h)}
                            title="Edit Holiday"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          >
                            <i className="fas fa-edit"></i>
                          </button>

                          {/* Toggle Active/Inactive */}
                          <button
                            onClick={() => setToggleModalHoliday(h)}
                            title={h.status === 'Active' ? 'Deactivate Holiday' : 'Activate Holiday'}
                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                              h.status === 'Active'
                                ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
                                : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                            }`}
                          >
                            <i className={`fas fa-${h.status === 'Active' ? 'pause-circle' : 'play-circle'}`}></i>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteModalHoliday(h)}
                            title="Delete Holiday"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Page <strong className="text-[#02275A]">{currentPage}</strong> of{' '}
              <strong className="text-[#02275A]">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <i className="fas fa-chevron-left mr-1"></i> Prev
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1.5 rounded-lg font-extrabold cursor-pointer transition-all ${
                      currentPage === pageNum
                        ? 'bg-[#02275A] text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Next <i className="fas fa-chevron-right ml-1"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD / EDIT HOLIDAY */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-base text-[#02275A]">
                {editingHoliday ? 'Edit Public Holiday' : 'Add New Public Holiday'}
              </h3>
              <button
                onClick={() => setFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1 rounded-lg"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSaveHoliday} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
                  Holiday Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Independence Day, New Year's Day"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#02275A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
                    Holiday Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#02275A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#02275A]"
                  >
                    <option value="National Holiday">National Holiday</option>
                    <option value="Company Holiday">Company Holiday</option>
                    <option value="Regional Holiday">Regional Holiday</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#02275A]"
                >
                  <option value="Active">Active (Visible to Employees)</option>
                  <option value="Inactive">Inactive (Hidden from Employees)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
                  Description <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide background context or holiday significance..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-[#02275A]"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#02275A] text-white text-xs font-extrabold rounded-xl shadow-xs hover:bg-opacity-90"
                >
                  {editingHoliday ? 'Save Changes' : 'Create Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW DETAILS */}
      {viewModalHoliday && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-[#02275A] flex items-center gap-2">
                <i className="fas fa-umbrella-beach text-amber-500"></i> Holiday Details
              </h3>
              <button
                onClick={() => setViewModalHoliday(null)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1 rounded-lg"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400">Holiday Name</span>
                <p className="text-sm font-black text-[#02275A] mt-0.5">{viewModalHoliday.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Date</span>
                  <p className="font-bold text-slate-800 mt-0.5">{viewModalHoliday.date}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Category</span>
                  <div className="mt-1">{getCategoryBadge(viewModalHoliday.category)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
                  <p className="font-bold text-slate-800 mt-0.5">{viewModalHoliday.status}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Created By</span>
                  <p className="font-bold text-slate-800 mt-0.5">{viewModalHoliday.createdBy}</p>
                </div>
              </div>

              {viewModalHoliday.description && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Description</span>
                  <p className="text-slate-700 font-medium mt-1 leading-relaxed">
                    {viewModalHoliday.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewModalHoliday(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: TOGGLE ACTIVE / INACTIVE CONFIRMATION */}
      {toggleModalHoliday && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center animate-scale-up space-y-4">
            <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xl ${
              toggleModalHoliday.status === 'Active' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <i className={`fas fa-${toggleModalHoliday.status === 'Active' ? 'pause' : 'play'}`}></i>
            </div>

            <div>
              <h3 className="font-extrabold text-base text-[#02275A]">
                {toggleModalHoliday.status === 'Active' ? 'Deactivate Holiday?' : 'Activate Holiday?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {toggleModalHoliday.status === 'Active'
                  ? `Deactivating "${toggleModalHoliday.name}" will hide it from the employee holiday calendar.`
                  : `Activating "${toggleModalHoliday.name}" will display it on employee holiday calendars and upcoming widgets.`}
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setToggleModalHoliday(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmToggleStatus}
                className={`px-5 py-2 text-white text-xs font-extrabold rounded-xl shadow-xs ${
                  toggleModalHoliday.status === 'Active'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Confirm {toggleModalHoliday.status === 'Active' ? 'Deactivation' : 'Activation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {deleteModalHoliday && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center animate-scale-up space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center text-xl">
              <i className="fas fa-trash-alt"></i>
            </div>

            <div>
              <h3 className="font-extrabold text-base text-[#02275A]">Delete Public Holiday?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong>"{deleteModalHoliday.name}"</strong>?
                This action cannot be undone, though an entry will remain in the administrative audit log.
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteModalHoliday(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-xs"
              >
                Yes, Delete Holiday
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: NOTIFICATION REMINDER SETTINGS */}
      {notifSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-base text-[#02275A] flex items-center gap-2">
                <i className="fas fa-bell text-amber-500"></i> Holiday Notification Reminders
              </h3>
              <button
                onClick={() => setNotifSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1 rounded-lg"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSaveNotifConfig} className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-extrabold text-slate-800 block">Enable Automated Reminders</span>
                  <span className="text-[11px] text-slate-500">
                    Send automated notices for upcoming public holidays.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifConfig.enabled}
                  onChange={(e) => setNotifConfig({ ...notifConfig, enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-[#02275A]"
                />
              </div>

              {notifConfig.enabled && (
                <>
                  <div className="space-y-2">
                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                      Reminder Schedules
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifConfig.remind7DaysBefore}
                        onChange={(e) =>
                          setNotifConfig({ ...notifConfig, remind7DaysBefore: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-[#02275A]"
                      />
                      <span className="font-bold text-slate-700">7 Days Before Holiday</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifConfig.remind3DaysBefore}
                        onChange={(e) =>
                          setNotifConfig({ ...notifConfig, remind3DaysBefore: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-[#02275A]"
                      />
                      <span className="font-bold text-slate-700">3 Days Before Holiday</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifConfig.remind1DayBefore}
                        onChange={(e) =>
                          setNotifConfig({ ...notifConfig, remind1DayBefore: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-[#02275A]"
                      />
                      <span className="font-bold text-slate-700">1 Day Before Holiday</span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                      Delivery Channels
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifConfig.inApp}
                          onChange={(e) => setNotifConfig({ ...notifConfig, inApp: e.target.checked })}
                          className="w-4 h-4 rounded text-[#02275A]"
                        />
                        <span className="font-bold text-slate-700">In-App Alerts</span>
                      </label>

                      <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifConfig.email}
                          onChange={(e) => setNotifConfig({ ...notifConfig, email: e.target.checked })}
                          className="w-4 h-4 rounded text-[#02275A]"
                        />
                        <span className="font-bold text-slate-700">Email Alerts</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNotifSettingsOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#02275A] text-white text-xs font-extrabold rounded-xl shadow-xs"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
