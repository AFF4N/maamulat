import React from 'react';
import { Award } from 'lucide-react';

interface DailyProgressBarProps {
  completedCount: number;
  totalCount: number;
  percentage: number;
  todayHasanat: number;
  dateLabel?: string;
  isViewingPastDay?: boolean;
}

export const DailyProgressBar: React.FC<DailyProgressBarProps> = ({
  completedCount,
  totalCount,
  percentage,
  todayHasanat,
  dateLabel,
  isViewingPastDay,
}) => {
  const isAllComplete = completedCount === totalCount && totalCount > 0;

  const titleEnglish = isViewingPastDay && dateLabel
    ? `${dateLabel}'s Progress`
    : "Today's Progress";

  const titleUrdu = isViewingPastDay && dateLabel
    ? `${dateLabel} کی پیشرفت`
    : "آج کی پیشرفت";

  return (
    <div className="rounded-2xl p-4 bg-white dark:bg-ink-800 border border-paper-300 dark:border-ink-700/80 shadow-soft-sm my-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
            {titleEnglish} <span className="font-normal text-[11px] opacity-75">({titleUrdu})</span>
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-bold text-ink-900 dark:text-white">
              {completedCount} <span className="text-xs font-normal text-ink-500">of</span> {totalCount}
            </span>
            <span className="text-xs font-semibold text-sage-600 dark:text-sage-400">
              ({percentage}%)
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-medium text-ink-500 dark:text-ink-400">
            {isViewingPastDay && dateLabel ? `Earned (${dateLabel})` : 'Earned Today'}
          </span>
          <p className="text-sm font-bold text-amberGold-600 dark:text-amberGold-400">
            +{todayHasanat} <span className="text-[10px] font-normal">Hasanat</span>
          </p>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-paper-200 dark:bg-ink-700/80 rounded-full h-2.5 overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isAllComplete
              ? 'bg-gradient-to-r from-sage-500 via-amberGold-500 to-emerald-500'
              : 'bg-sage-600 dark:bg-sage-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Understated celebratory message if complete */}
      {isAllComplete && (
        <div className="rounded-xl p-2.5 bg-sage-50 dark:bg-sage-950/40 border border-sage-200 dark:border-sage-800/80 flex items-center gap-2.5 text-xs text-sage-900 dark:text-sage-200 animate-fadeIn">
          <Award className="w-4 h-4 text-amberGold-600 flex-shrink-0" />
          <div className="leading-snug">
            <span className="font-bold">ما شاء الله تبارك الله · Alhamdulillah!</span>
            <p className="text-[11px] text-sage-700 dark:text-sage-300">
              All 23 daily Maamulat completed. May Allah accept your devotion and bless your time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
