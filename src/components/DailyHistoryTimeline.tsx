import React, { useState } from 'react';
import type { DayRecord } from '../types';
import { Check, X, Calendar } from 'lucide-react';

interface DailyHistoryTimelineProps {
  history: DayRecord[];
  completedTodayCount: number;
}

export const DailyHistoryTimeline: React.FC<DailyHistoryTimelineProps> = ({
  history,
  completedTodayCount,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<DayRecord | null>(null);

  // Take the last 6 days from history + today as the 7th item
  const recentDays = (history || []).slice(0, 6).reverse();

  // Helper to format short date like "3 Oct"
  const formatShortDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

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
          Last 7 Days
        </span>
      </div>

      {/* Pill Row */}
      <div className="grid grid-cols-7 gap-1.5 pt-1">
        {/* Past days */}
        {recentDays.map((rec) => {
          const isPassed = rec.status === 'completed';
          const isPartial = rec.status === 'partial';

          return (
            <button
              key={rec.date}
              onClick={() => setSelectedRecord(rec)}
              className={`flex flex-col items-center py-2 px-1 rounded-xl border text-center transition-all tap-bounce ${
                isPassed
                  ? 'bg-sage-50/80 dark:bg-sage-950/40 border-sage-200 dark:border-sage-800 text-sage-800 dark:text-sage-300'
                  : isPartial
                  ? 'bg-amberGold-50/80 dark:bg-amberGold-950/30 border-amberGold-200 dark:border-amberGold-800 text-amberGold-800 dark:text-amberGold-300'
                  : 'bg-terracotta-50/80 dark:bg-terracotta-950/30 border-terracotta-100 dark:border-terracotta-900/50 text-terracotta-600 dark:text-terracotta-400'
              }`}
            >
              <span className="text-[10px] font-medium opacity-80 mb-1">
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

        {/* Fill empty placeholder pills if less than 6 past records exist */}
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

        {/* Today Pill */}
        <div className="flex flex-col items-center py-2 px-1 rounded-xl border border-sage-500 bg-sage-100/70 dark:bg-sage-900/40 text-sage-900 dark:text-white text-center shadow-sm">
          <span className="text-[10px] font-bold text-sage-700 dark:text-sage-300 mb-1">
            Today
          </span>
          <span className="w-5 h-5 rounded-full bg-sage-600 text-white flex items-center justify-center text-[10px] font-bold">
            ◐
          </span>
          <span className="text-[9px] font-bold mt-1 text-sage-700 dark:text-sage-300">
            {completedTodayCount}
          </span>
        </div>
      </div>

      {/* Selected day mini details modal / popup */}
      {selectedRecord && (
        <div className="mt-3 p-2.5 rounded-xl bg-paper-100 dark:bg-ink-700/60 border border-paper-300 dark:border-ink-600 flex items-center justify-between text-xs animate-fadeIn">
          <div>
            <span className="font-semibold text-ink-900 dark:text-white">
              {formatShortDate(selectedRecord.date)} ({selectedRecord.urduDate})
            </span>
            <p className="text-[11px] text-ink-600 dark:text-ink-400">
              Completed {selectedRecord.completedCount} of {selectedRecord.totalCount} · Takbeer-e-Oola: {selectedRecord.takbeerOola}/5
            </p>
          </div>
          <button
            onClick={() => setSelectedRecord(null)}
            className="text-[11px] font-semibold text-sage-700 dark:text-sage-300 px-2 py-1 rounded bg-white dark:bg-ink-800 border border-paper-300 dark:border-ink-600"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
