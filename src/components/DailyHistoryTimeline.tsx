import React, { useState, useMemo } from 'react';
import type { DayRecord } from '../types';
import { Check, X, Calendar } from 'lucide-react';
import { formatShortDate } from '../utils/dateUtils';
import { isDayQualified } from '../utils/streakUtils';
import { STREAK_PASS_PERCENTAGE } from '../constants';
import { DatePickerModal } from './DatePickerModal';

interface DailyHistoryTimelineProps {
  history: DayRecord[];
  todayDate: string;
  completedTodayCount: number;
  totalTodayCount?: number;
  isTodayQualified?: boolean;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const DailyHistoryTimeline: React.FC<DailyHistoryTimelineProps> = ({
  history,
  todayDate,
  completedTodayCount,
  totalTodayCount = 25,
  isTodayQualified = false,
  selectedDate,
  onSelectDate,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Take up to the last 6 days from history (newest first in array, so slice(0, 6) and reverse for chronological left-to-right)
  const recentDays = (history || []).slice(0, 6).reverse();

  const isTodaySelected = selectedDate === todayDate;

  // Compute all available dates (history entries + today)
  const availableDates = useMemo(() => {
    const dates = (history || []).map((h) => h.date);
    if (!dates.includes(todayDate)) {
      dates.push(todayDate);
    }
    return dates;
  }, [history, todayDate]);

  // Compute status map for dots in the date picker
  const dateStatusMap = useMemo(() => {
    const map: Record<string, 'passed' | 'partial' | 'missed' | 'today'> = {};
    (history || []).forEach((h) => {
      map[h.date] = isDayQualified(h) ? 'passed' : h.completedCount > 0 ? 'partial' : 'missed';
    });
    map[todayDate] = 'today';
    return map;
  }, [history, todayDate]);

  return (
    <div className="rounded-2xl p-3.5 bg-white dark:bg-ink-800 border border-paper-300 dark:border-ink-700/80 shadow-soft-sm my-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
            Recent Days (سابقہ ایام)
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold text-sage-700 dark:text-sage-300 bg-sage-50 dark:bg-sage-950/60 hover:bg-sage-100 dark:hover:bg-sage-900/60 border border-sage-200/90 dark:border-sage-800 transition-colors tap-bounce cursor-pointer"
          title="Browse all available historic dates"
        >
          <Calendar className="w-3 h-3 text-sage-600 dark:text-sage-400" />
          <span>Pick Date ▾</span>
        </button>
      </div>

      {/* 7-Day Pill Row */}
      <div className="grid grid-cols-7 gap-1 pt-1">
        {/* Fill empty placeholder pills on the left so dates stack against Today on the right */}
        {Array.from({ length: Math.max(0, 6 - recentDays.length) }).map((_, i) => (
          <div
            key={`placeholder-${i}`}
            className="flex flex-col items-center py-2 px-1 rounded-xl border-2 border-dashed border-paper-300 dark:border-ink-700/60 bg-paper-50/40 dark:bg-ink-800/40 text-ink-300 dark:text-ink-600 text-center"
          >
            <span className="text-[10px] font-normal mb-1 opacity-50">—</span>
            <span className="w-5 h-5 rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-paper-300/80 dark:bg-ink-700/60" />
            </span>
            <span className="text-[9px] mt-1 opacity-40">—</span>
          </div>
        ))}

        {/* Past days (ordered oldest -> yesterday right before Today) */}
        {recentDays.map((rec) => {
          const isPassed = isDayQualified(rec);
          const isPartial = !isPassed && rec.completedCount > 0;
          const isSelected = selectedDate === rec.date;

          const stateStyles = isPassed
            ? {
                base: 'bg-sage-50/90 dark:bg-sage-950/40 text-sage-800 dark:text-sage-300',
                selected: 'border-sage-600 dark:border-sage-400 z-10',
                unselected: 'border-sage-200/90 dark:border-sage-800/80 hover:border-sage-400',
              }
            : isPartial
              ? {
                  base: 'bg-amberGold-50/90 dark:bg-amberGold-950/30 text-amberGold-800 dark:text-amberGold-300',
                  selected: 'border-amberGold-500 dark:border-amberGold-400 z-10',
                  unselected: 'border-amberGold-200/90 dark:border-amberGold-800/80 hover:border-amberGold-400',
                }
              : {
                  base: 'bg-terracotta-50/90 dark:bg-terracotta-950/30 text-terracotta-600 dark:text-terracotta-400',
                  selected: 'border-terracotta-500 dark:border-terracotta-400 z-10',
                  unselected: 'border-terracotta-200/70 dark:border-terracotta-900/50 hover:border-terracotta-400',
                };

          return (
            <button
              key={rec.date}
              onClick={() => onSelectDate(rec.date)}
              className={`flex flex-col items-center py-2 px-1 rounded-xl border-2 text-center transition-colors tap-bounce relative whitespace-nowrap ${stateStyles.base} ${
                isSelected ? stateStyles.selected : stateStyles.unselected
              }`}
              title={`${rec.date} (${rec.completedCount}/${rec.totalCount}) - ${isPassed ? `Passed (≥${STREAK_PASS_PERCENTAGE}%)` : isPartial ? `Partial (<${STREAK_PASS_PERCENTAGE}%)` : 'Missed (0)'}`}
            >
              <span className={`text-[10px] font-medium mb-1 ${isSelected ? 'font-bold text-ink-900 dark:text-white' : 'opacity-80'}`}>
                {formatShortDate(rec.date)}
              </span>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                {isPassed ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : isPartial ? (
                  <span className="text-[10px]">◐</span>
                ) : (
                  <X className="w-3 h-3 stroke-[2.5]" />
                )}
              </span>
              <span className="text-[9px] mt-1 opacity-70">
                {rec.completedCount}
              </span>
            </button>
          );
        })}

        {/* Today Pill */}
        <button
          onClick={() => onSelectDate(todayDate)}
          className={`flex flex-col items-center py-2 px-1 rounded-xl border-2 text-center transition-colors tap-bounce relative ${
            isTodaySelected
              ? 'border-sage-600 dark:border-sage-400 bg-sage-100/90 dark:bg-sage-900/60 text-sage-900 dark:text-white z-10'
              : 'border-sage-300 dark:border-sage-700/80 bg-sage-50/50 dark:bg-sage-950/20 text-sage-800 dark:text-sage-300 hover:border-sage-400'
          }`}
          title={`آج کا دن (Today) - ${completedTodayCount}/${totalTodayCount} ${isTodayQualified ? '(Passed)' : '(In Progress)'}`}
        >
          <span className={`text-[10px] mb-1 ${isTodaySelected ? 'font-bold text-sage-800 dark:text-sage-200' : 'font-medium'}`}>
            Today
          </span>
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
              isTodayQualified
                ? 'bg-sage-600 dark:bg-sage-500 text-white shadow-xs'
                : completedTodayCount > 0
                  ? 'bg-sage-600 dark:bg-sage-500 text-white text-[10px] font-bold shadow-xs'
                  : 'border border-sage-400/60 dark:border-sage-600/60 bg-sage-500/10 dark:bg-sage-400/10'
            }`}
          >
            {isTodayQualified ? (
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : completedTodayCount > 0 ? (
              <span className="text-[10px] leading-none">◐</span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-sage-500/80 dark:bg-sage-400/80" />
            )}
          </span>
          <span className="text-[9px] font-bold mt-1 text-sage-700 dark:text-sage-300">
            {completedTodayCount}
          </span>
        </button>
      </div>
      {/* Legend & Guidance */}
      <div className="flex items-center justify-between pt-2 px-1 text-[10px] text-ink-400 dark:text-ink-500 border-t border-paper-200/60 dark:border-ink-700/40 mt-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sage-500 inline-block" /> Pass 
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amberGold-500 inline-block" /> Partial 
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-terracotta-500 inline-block" /> Missed
          </span>
        </div>
        <span className="font-medium text-ink-400 dark:text-ink-500">
          Tap to select
        </span>
      </div>

      <DatePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        availableDates={availableDates}
        dateStatusMap={dateStatusMap}
        title="Select Historic Day"
      />
    </div>
  );
};
