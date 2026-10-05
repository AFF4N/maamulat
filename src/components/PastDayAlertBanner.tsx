import React from 'react';

interface PastDayAlertBannerProps {
  dateLabel: string;
  isYesterday: boolean;
  onReturnToToday: () => void;
}

export const PastDayAlertBanner: React.FC<PastDayAlertBannerProps> = ({
  dateLabel,
  isYesterday,
  onReturnToToday,
}) => {
  return (
    <aside
      aria-label="Past day viewing indicator"
      className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 animate-fadeIn shadow-soft-sm"
    >
      <div className="flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
        <div>
          <span className="font-bold block">
            Viewing Past Day: {dateLabel} {isYesterday ? '(Yesterday)' : ''} ·{' '}
            <span className="arabic-text font-normal opacity-75">سابقہ دن کا ریکارڈ</span>
          </span>
          <span className="text-[11px] opacity-85 block mt-0.5">
            You are viewing and editing {dateLabel}'s sheet.
            <span className="arabic-text opacity-75"> (معمولات تبدیل کر کے نیچے سے رپورٹ بھیجیں)</span>
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onReturnToToday}
        className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-sm tap-bounce transition-all ml-2"
      >
        Return to Today
      </button>
    </aside>
  );
};
