import React from 'react';
import type { AdminState } from '../../types';

interface ScheduleTabProps {
  adminData: AdminState | null;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({ adminData }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-ink-850 p-5 rounded-3xl border border-paper-300 dark:border-ink-800 shadow-soft-sm space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink-900 dark:text-white">
              Vercel Automated Cron
            </h2>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              Automated schedule settings and last execution log.
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
            Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-paper-50 dark:bg-ink-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
              Execution Time
            </span>
            <div className="font-bold text-ink-900 dark:text-white">
              9:00 PM PKT (Pakistan Time)
            </div>
            <div className="text-[11px] text-ink-500 dark:text-ink-400">
              16:00 UTC (Configured in <code className="font-mono">vercel.json</code>)
            </div>
          </div>

          <div className="p-3 rounded-xl bg-paper-50 dark:bg-ink-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
              Cron Schedule Expression
            </span>
            <div className="font-mono font-bold text-ink-900 dark:text-white">
              0 16 * * *
            </div>
            <div className="text-[11px] text-ink-500 dark:text-ink-400">
              Fires once every 24 hours
            </div>
          </div>
        </div>

        {adminData?.lastCronLog && (
          <div className="p-3.5 rounded-2xl bg-paper-100 dark:bg-ink-800 border border-paper-200 dark:border-ink-700 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Last Automated Execution
            </span>
            <div className="text-xs font-semibold text-ink-900 dark:text-white">
              {adminData.lastCronLog.reminder?.title || 'Daily Reminder'}
            </div>
            <p className="text-xs text-ink-600 dark:text-ink-300">
              {adminData.lastCronLog.reminder?.body}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-ink-500 dark:text-ink-400 pt-1">
              <span>{new Date(adminData.lastCronLog.timestamp).toLocaleString()}</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold">
                {adminData.lastCronLog.sentCount} delivered
              </span>
              <span>•</span>
              <span>{adminData.lastCronLog.prunedCount} cleaned</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
