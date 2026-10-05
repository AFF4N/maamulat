import React from 'react';
import type { DayRecord } from '../types';
import { Check, X, Calendar } from 'lucide-react';
import { formatShortDate } from '../utils/dateUtils';

interface DailyHistoryTimelineProps {
  history: DayRecord[];
  todayDate: string;
  completedTodayCount: number;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const DailyHistoryTimeline: React.FC<DailyHistoryTimelineProps> = ({
  history,
  todayDate,
  completedTodayCount,
  selectedDate,
  onSelectDate,
}) => {
  // Take up to the last 6 days from history (newest first in array, so slice(0, 6) and reverse for chronological left-to-right)
  const recentDays = (history || []).slice(0, 6).reverse();

  const isTodaySelected = selectedDate === todayDate;

  return (
    <div className="rounded-2xl p-3.5 bg-white dark:bg-ink-800 border border-paper-300 dark:border-ink-700/80 shadow-soft-sm my-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
            Recent Days (سابقہ ایام)
          </span>
        </div>
        <span className="text-[10px] text-ink-400 dark:text-ink-500">
          Last 7 Days · Tap to select
        </span>
      </div>

      {/* 7-Day Pill Row */}
      <div className="grid grid-cols-7 gap-1.5 pt-1">
        {/* Fill empty placeholder pills on the left so dates stack against Today on the right */}
        {Array.from({ length: Math.max(0, 6 - recentDays.length) }).map((_, i) => (
          <div
            key={`placeholder-${i}`}
            className="flex flex-col items-center py-2 px-1 rounded-xl border border-dashed border-paper-300 dark:border-ink-700/60 bg-paper-50/40 dark:bg-ink-800/40 text-ink-300 dark:text-ink-600 text-center"
          >
            <span className="text-[10px] font-normal mb-1 opacity-50">—</span>
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs">
              ·
            </span>
            <span className="text-[9px] mt-1 opacity-40">—</span>
          </div>
        ))}

        {/* Past days (ordered oldest -> yesterday right before Today) */}
        {recentDays.map((rec) => {
          const isPassed = rec.status === 'completed';
          const isPartial = rec.status === 'partial';
          const isSelected = selectedDate === rec.date;

          return (
            <button
              key={rec.date}
              onClick={() => onSelectDate(rec.date)}
              className={`flex flex-col items-center py-2 px-1 rounded-xl border text-center transition-all tap-bounce relative ${isSelected
                  ? 'ring-2 ring-sage-600 dark:ring-sage-400 shadow-sm scale-[1.03] z-10 '
                  : 'hover:border-sage-400 '
                } ${isPassed
                  ? 'bg-sage-50/90 dark:bg-sage-950/40 border-sage-200 dark:border-sage-800 text-sage-800 dark:text-sage-300'
                  : isPartial
                    ? 'bg-amberGold-50/90 dark:bg-amberGold-950/30 border-amberGold-200 dark:border-amberGold-800 text-amberGold-800 dark:text-amberGold-300'
                    : 'bg-terracotta-50/90 dark:bg-terracotta-950/30 border-terracotta-100 dark:border-terracotta-900/50 text-terracotta-600 dark:text-terracotta-400'
                }`}
              title={`${rec.date} (${rec.completedCount}/${rec.totalCount})`}
            >
              {isSelected && (
                <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-sage-600 dark:bg-sage-400" />
              )}
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
          className={`flex flex-col items-center py-2 px-1 rounded-xl border text-center transition-all tap-bounce relative ${isTodaySelected
              ? 'border-sage-600 bg-sage-100/90 dark:bg-sage-900/60 text-sage-900 dark:text-white ring-2 ring-sage-600 dark:ring-sage-400 shadow-sm scale-[1.03] z-10'
              : 'border-sage-400/60 bg-sage-50/50 dark:bg-sage-950/20 text-sage-800 dark:text-sage-300 hover:border-sage-500'
            }`}
          title="آج کا دن (Today)"
        >
          {isTodaySelected && (
            <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-sage-600 dark:bg-sage-400" />
          )}
          <span className={`text-[10px] mb-1 ${isTodaySelected ? 'font-bold text-sage-800 dark:text-sage-200' : 'font-medium'}`}>
            Today
          </span>
          <span className="w-5 h-5 rounded-full bg-sage-600 text-white flex items-center justify-center text-[10px] font-bold">
            ◐
          </span>
          <span className="text-[9px] font-bold mt-1 text-sage-700 dark:text-sage-300">
            {completedTodayCount}
          </span>
        </button>
      </div>
    </div>
  );
};
