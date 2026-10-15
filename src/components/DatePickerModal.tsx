import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react';

export type DateStatus = 'passed' | 'partial' | 'missed' | 'today';

export interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  availableDates: string[]; // only these dates are selectable
  dateStatusMap?: Record<string, DateStatus>;
  title?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  availableDates,
  dateStatusMap = {},
  title = 'Select Date',
}) => {
  // Parse initial view year and month from selectedDate (or current date)
  const initialYearMonth = useMemo(() => {
    if (selectedDate && selectedDate.includes('-')) {
      const [y, m] = selectedDate.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        return { year: y, month: m - 1 };
      }
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }, [selectedDate]);

  const [viewYear, setViewYear] = useState<number>(initialYearMonth.year);
  const [viewMonth, setViewMonth] = useState<number>(initialYearMonth.month);

  // Sync view when selectedDate changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      setViewYear(initialYearMonth.year);
      setViewMonth(initialYearMonth.month);
    }
  }, [isOpen, initialYearMonth]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);

  // Previous & Next Month handlers
  const handlePrevMonth = () => {
    setViewMonth((prev) => {
      if (prev === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setViewMonth((prev) => {
      if (prev === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  // Calendar cells generation for viewMonth
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();

    const days: Array<{
      dayNumber: number;
      dateStr: string;
      isAvailable: boolean;
      isSelected: boolean;
      status?: DateStatus;
    }> = [];

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isAvailable = availableSet.has(dateStr);
      const isSelected = selectedDate === dateStr;
      const status = dateStatusMap[dateStr];

      days.push({
        dayNumber: d,
        dateStr,
        isAvailable,
        isSelected,
        status,
      });
    }

    return { firstDayIndex, days };
  }, [viewYear, viewMonth, availableSet, selectedDate, dateStatusMap]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="datepicker-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-950/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs sm:max-w-sm rounded-2xl bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-700 p-4 shadow-soft-xl space-y-3.5 my-auto max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-paper-200/80 dark:border-ink-750 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-sage-100 dark:bg-sage-950/60 text-sage-700 dark:text-sage-300">
              <CalendarIcon className="w-4 h-4" />
            </span>
            <div className='flex flex-col'>
              <h2
                id="datepicker-modal-title"
                className="text-sm font-bold text-ink-900 dark:text-white leading-tight"
              >
                {title}
              </h2>
              <span className="text-[10px] font-medium text-ink-600 dark:text-ink-400">
                {availableDates.length} recorded {availableDates.length === 1 ? 'day' : 'days'} available
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-white hover:bg-paper-100 dark:hover:bg-ink-750 transition-colors tap-bounce"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-paper-300 dark:border-ink-700 hover:bg-paper-100 dark:hover:bg-ink-750 text-ink-700 dark:text-ink-200 tap-bounce transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs sm:text-sm font-bold text-ink-900 dark:text-white text-center flex-1">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-paper-300 dark:border-ink-700 hover:bg-paper-100 dark:hover:bg-ink-750 text-ink-700 dark:text-ink-200 tap-bounce transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-[10px] font-bold text-ink-700 dark:text-ink-300">
          {WEEKDAY_NAMES.map((name) => (
            <div key={name} className="h-7 w-9 mx-auto flex items-center justify-center text-center">
              {name}
            </div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty prefix cells */}
          {Array.from({ length: calendarDays.firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-9 w-9 mx-auto" />
          ))}

          {/* Days */}
          {calendarDays.days.map((item) => {
            const isClickable = item.isAvailable;
            const hasStatusDot =
              isClickable &&
              (item.status === 'passed' || item.status === 'partial' || item.status === 'missed');

            return (
              <button
                key={item.dateStr}
                type="button"
                disabled={!isClickable}
                onClick={() => {
                  if (isClickable) {
                    onSelectDate(item.dateStr);
                    onClose();
                  }
                }}
                className={`h-9 w-9 mx-auto rounded-xl text-xs font-semibold flex flex-col items-center justify-center text-center transition-all ${
                  item.isSelected
                    ? 'bg-sage-600 text-white font-bold ring-2 ring-sage-400 dark:ring-white/80 shadow-soft-sm tap-bounce'
                    : isClickable
                    ? 'hover:bg-sage-100 dark:hover:bg-ink-750 text-ink-900 dark:text-white border border-paper-300 dark:border-ink-700/60 tap-bounce'
                    : 'text-ink-400 dark:text-ink-600 cursor-not-allowed font-medium'
                }`}
                title={
                  isClickable
                    ? `${item.dateStr} (Click to view)`
                    : `${item.dateStr} (No record available)`
                }
              >
                <span className="leading-none">{item.dayNumber}</span>
                {hasStatusDot && (
                  <span
                    className={`w-1 h-1 rounded-full mt-1 ${
                      item.isSelected
                        ? 'bg-white'
                        : item.status === 'passed'
                        ? 'bg-sage-500'
                        : item.status === 'partial'
                        ? 'bg-amberGold-500'
                        : 'bg-terracotta-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend & Action row */}
        <div className="flex items-center justify-between pt-2 border-t border-paper-200/80 dark:border-ink-750 text-[10px] text-ink-650 dark:text-ink-400 font-medium">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-500 inline-block" /> Pass
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amberGold-500 inline-block" /> Partial
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500 inline-block" /> Missed
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-ink-600 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-750 tap-bounce"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePickerModal;
