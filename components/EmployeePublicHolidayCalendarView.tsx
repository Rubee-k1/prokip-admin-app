import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PublicHoliday, getPublicHolidays } from './leaveUtils';

interface EmployeePublicHolidayCalendarViewProps {
  onBack?: () => void;
}

export const EmployeePublicHolidayCalendarView: React.FC<EmployeePublicHolidayCalendarViewProps> = ({ onBack }) => {
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [viewType, setViewType] = useState<'calendar' | 'list'>('calendar');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-11
  const [selectedHolidayDetail, setSelectedHolidayDetail] = useState<PublicHoliday | null>(null);

  const loadData = useCallback(() => {
    const all = getPublicHolidays();
    // Filter strictly for ACTIVE holidays for employee view
    const activeOnly = all.filter((h) => h.status === 'Active');
    setHolidays(activeOnly);
  }, []);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('leaveDataUpdated', handleUpdate);
    return () => window.removeEventListener('leaveDataUpdated', handleUpdate);
  }, [loadData]);

  // Available Years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    holidays.forEach((h) => {
      if (h.date) {
        const y = h.date.split('-')[0];
        if (y) years.add(y);
      }
    });
    if (years.size === 0) years.add('2026');
    return Array.from(years).sort();
  }, [holidays]);

  // Filtered Holidays for employee
  const filteredHolidays = useMemo(() => {
    return holidays.filter((h) => {
      const matchCat = selectedCategory === 'All' || h.category === selectedCategory;
      const hYear = h.date ? h.date.split('-')[0] : '';
      const matchYear = selectedYear === 'All' || hYear === selectedYear;
      return matchCat && matchYear;
    });
  }, [holidays, selectedCategory, selectedYear]);

  // Chronological List View Items
  const chronologicalHolidays = useMemo(() => {
    return [...filteredHolidays].sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredHolidays]);

  // Calendar Days Calculation for current Month/Year
  const calendarDays = useMemo(() => {
    const yearNum = parseInt(selectedYear, 10) || new Date().getFullYear();
    const monthNum = selectedMonth;

    const firstDay = new Date(yearNum, monthNum, 1);
    const lastDay = new Date(yearNum, monthNum + 1, 0);

    const startingDayOfWeek = firstDay.getDay(); // 0 = Sun, 1 = Mon ...
    const totalDaysInMonth = lastDay.getDate();

    const days: Array<{ dayNumber: number | null; dateStr: string | null; holidays: PublicHoliday[] }> = [];

    // Blank cells before day 1
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ dayNumber: null, dateStr: null, holidays: [] });
    }

    // Days of month
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const monthPadded = String(monthNum + 1).padStart(2, '0');
      const dayPadded = String(day).padStart(2, '0');
      const dateStr = `${yearNum}-${monthPadded}-${dayPadded}`;

      const matchedHolidays = filteredHolidays.filter((h) => h.date === dateStr);
      days.push({ dayNumber: day, dateStr, holidays: matchedHolidays });
    }

    return days;
  }, [selectedYear, selectedMonth, filteredHolidays]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      const prevYr = String(parseInt(selectedYear, 10) - 1);
      if (availableYears.includes(prevYr)) setSelectedYear(prevYr);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      const nextYr = String(parseInt(selectedYear, 10) + 1);
      if (availableYears.includes(nextYr)) setSelectedYear(nextYr);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'Company Holiday':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Regional Holiday':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      default:
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#02275A] to-blue-900 text-white rounded-2xl p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 text-2xl shadow-inner">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Public Holiday Calendar</h2>
            <p className="text-xs text-blue-200 mt-0.5">
              Official company & national public holiday schedule for organizational awareness.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle View Mode */}
          <div className="bg-white/10 p-1 rounded-xl border border-white/20 flex items-center gap-1">
            <button
              onClick={() => setViewType('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewType === 'calendar' ? 'bg-amber-400 text-[#02275A] shadow-xs' : 'text-white hover:bg-white/10'
              }`}
            >
              <i className="fas fa-calendar-grid mr-1.5"></i> Calendar View
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewType === 'list' ? 'bg-amber-400 text-[#02275A] shadow-xs' : 'text-white hover:bg-white/10'
              }`}
            >
              <i className="fas fa-list-ul mr-1.5"></i> List View
            </button>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fas fa-arrow-left"></i> Back
            </button>
          )}
        </div>
      </div>

      {/* Informational Policy Banner */}
      <div className="bg-blue-50/90 border border-blue-200 p-4 rounded-2xl flex items-center gap-3 text-xs text-blue-900">
        <i className="fas fa-info-circle text-blue-600 text-base"></i>
        <div>
          <strong className="font-extrabold">Informational Notice: </strong>
          Public holidays are published for staff planning and schedule coordination. Public holidays do not affect individual leave balances or entitlement calculations.
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#02275A]"
            >
              <option value="All">All Categories</option>
              <option value="National Holiday">National Holiday</option>
              <option value="Company Holiday">Company Holiday</option>
              <option value="Regional Holiday">Regional Holiday</option>
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#02275A]"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Year {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Month Navigation (For Calendar View) */}
        {viewType === 'calendar' && (
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs transition-all cursor-pointer"
              title="Previous Month"
            >
              <i className="fas fa-chevron-left"></i>
            </button>

            <span className="font-black text-sm text-[#02275A] min-w-[130px] text-center">
              {monthNames[selectedMonth]} {selectedYear}
            </span>

            <button
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs transition-all cursor-pointer"
              title="Next Month"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: CALENDAR VIEW */}
      {viewType === 'calendar' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Grid of Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((cell, idx) => {
              if (cell.dayNumber === null) {
                return (
                  <div
                    key={`blank-${idx}`}
                    className="h-24 sm:h-28 bg-slate-50/40 rounded-xl border border-dashed border-slate-100/60"
                  ></div>
                );
              }

              const hasHolidays = cell.holidays.length > 0;
              const isToday =
                new Date().getDate() === cell.dayNumber &&
                new Date().getMonth() === selectedMonth &&
                String(new Date().getFullYear()) === selectedYear;

              return (
                <div
                  key={`day-${cell.dayNumber}`}
                  className={`h-24 sm:h-28 p-2 rounded-xl border transition-all flex flex-col justify-between overflow-hidden ${
                    hasHolidays
                      ? 'bg-amber-50/40 border-amber-200/80 shadow-2xs hover:border-amber-400'
                      : 'bg-white border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-[#02275A] text-white flex items-center justify-center'
                          : hasHolidays
                          ? 'text-amber-900 font-black'
                          : 'text-slate-700'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {hasHolidays && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-amber-200/80 text-amber-900 rounded-md">
                        Holiday
                      </span>
                    )}
                  </div>

                  {/* Holiday Cards inside cell */}
                  <div className="space-y-1 overflow-y-auto max-h-[60px] scrollbar-thin">
                    {cell.holidays.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => setSelectedHolidayDetail(h)}
                        className={`w-full text-left p-1 rounded-md text-[10px] font-bold truncate border transition-transform hover:scale-102 cursor-pointer ${getCategoryBadgeClass(
                          h.category
                        )}`}
                        title={h.name}
                      >
                        <i className="fas fa-umbrella-beach mr-1 text-[8px]"></i>
                        {h.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW 2: LIST VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {chronologicalHolidays.length === 0 ? (
            <div className="p-12 text-center bg-slate-50/50">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-xl mb-3">
                <i className="fas fa-calendar-times"></i>
              </div>
              <h4 className="font-bold text-slate-700 text-sm mb-1">No Active Holidays Found</h4>
              <p className="text-xs text-slate-400">
                No active public holidays match your current filter criteria.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {chronologicalHolidays.map((h) => {
                const dateObj = new Date(h.date + 'T00:00:00');
                const formattedDate = !isNaN(dateObj.getTime())
                  ? dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                  : h.date;

                return (
                  <div
                    key={h.id}
                    className="p-4 sm:p-5 hover:bg-slate-50/80 transition-all flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex flex-col items-center justify-center text-center shadow-2xs">
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          {!isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('en-US', { month: 'short' }) : 'HOL'}
                        </span>
                        <span className="text-base font-black text-[#02275A] leading-none">
                          {!isNaN(dateObj.getTime()) ? dateObj.getDate() : ''}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-[#02275A] flex items-center gap-2">
                          {h.name}
                        </h4>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                          <i className="far fa-calendar mr-1.5 text-blue-500"></i>
                          {formattedDate}
                        </p>
                        {h.description && (
                          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                            {h.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-xs font-extrabold rounded-xl border ${getCategoryBadgeClass(h.category)}`}>
                        {h.category}
                      </span>
                      <button
                        onClick={() => setSelectedHolidayDetail(h)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* HOLIDAY DETAIL MODAL */}
      {selectedHolidayDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-[#02275A] flex items-center gap-2">
                <i className="fas fa-umbrella-beach text-amber-500"></i> Public Holiday Details
              </h3>
              <button
                onClick={() => setSelectedHolidayDetail(null)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1 rounded-lg"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
                <span className="text-[10px] font-black uppercase text-amber-800">Holiday Name</span>
                <h4 className="text-base font-black text-[#02275A] mt-0.5">{selectedHolidayDetail.name}</h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Date</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">{selectedHolidayDetail.date}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Category</span>
                  <p className="font-extrabold text-indigo-700 mt-0.5">{selectedHolidayDetail.category}</p>
                </div>
              </div>

              {selectedHolidayDetail.description && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Description</span>
                  <p className="text-slate-700 font-medium mt-1 leading-relaxed">
                    {selectedHolidayDetail.description}
                  </p>
                </div>
              )}

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-900">
                <i className="fas fa-info-circle mr-1 text-blue-600"></i>
                This public holiday is for general workplace awareness and does not deduct from your annual or leave balance.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedHolidayDetail(null)}
                className="px-5 py-2 bg-[#02275A] text-white font-extrabold text-xs rounded-xl shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
