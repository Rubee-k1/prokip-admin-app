import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PublicHoliday, getPublicHolidays } from './leaveUtils';

interface UpcomingHolidaysWidgetProps {
  onViewAll?: () => void;
  maxCount?: number;
}

export const UpcomingHolidaysWidget: React.FC<UpcomingHolidaysWidgetProps> = ({
  onViewAll,
  maxCount = 4
}) => {
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);

  const loadHolidays = useCallback(() => {
    setHolidays(getPublicHolidays());
  }, []);

  useEffect(() => {
    loadHolidays();
    const handleUpdate = () => loadHolidays();
    window.addEventListener('leaveDataUpdated', handleUpdate);
    return () => window.removeEventListener('leaveDataUpdated', handleUpdate);
  }, [loadHolidays]);

  // Compute upcoming active holidays relative to current date
  const upcomingHolidays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeOnly = holidays.filter((h) => h.status === 'Active');

    // Sort by date ascending
    const sorted = [...activeOnly].sort((a, b) => a.date.localeCompare(b.date));

    // Filter to holidays today or in future, or closest upcoming
    const futureOrToday = sorted.filter((h) => {
      const hDate = new Date(h.date + 'T00:00:00');
      return hDate >= today;
    });

    // If future holidays are fewer than maxCount, take the closest future ones, or fallback to earliest
    const result = futureOrToday.length > 0 ? futureOrToday : sorted;
    return result.slice(0, maxCount);
  }, [holidays, maxCount]);

  const getDaysDiffText = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    if (isNaN(target.getTime())) return '';

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 1) return `In ${diffDays} days`;
    return 'Past';
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'Company Holiday':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Regional Holiday':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm border border-amber-100">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#02275A]">Upcoming Public Holidays</h3>
            <p className="text-[11px] text-slate-400">Official company & national holiday schedule</p>
          </div>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-blue-600 hover:text-[#02275A] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View Calendar</span>
            <i className="fas fa-arrow-right text-[10px]"></i>
          </button>
        )}
      </div>

      {upcomingHolidays.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl">
          No active upcoming public holidays.
        </div>
      ) : (
        <div className="space-y-2.5">
          {upcomingHolidays.map((h) => {
            const dateObj = new Date(h.date + 'T00:00:00');
            const formattedDate = !isNaN(dateObj.getTime())
              ? dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
              : h.date;
            const daysText = getDaysDiffText(h.date);

            return (
              <div
                key={h.id}
                className="p-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center text-center shadow-2xs">
                    <span className="text-[9px] font-black uppercase text-amber-600 leading-none">
                      {!isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('en-US', { month: 'short' }) : 'HOL'}
                    </span>
                    <span className="text-sm font-black text-[#02275A] leading-none mt-0.5">
                      {!isNaN(dateObj.getTime()) ? dateObj.getDate() : ''}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-xs text-[#02275A]">{h.name}</h4>
                    <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{formattedDate}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 text-right">
                  <span
                    className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${getCategoryBadgeClass(
                      h.category
                    )}`}
                  >
                    {h.category.replace(' Holiday', '')}
                  </span>

                  {daysText && (
                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      {daysText}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
