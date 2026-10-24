import React from 'react';
import { Database, Server, RefreshCw } from 'lucide-react';
import type { AdminState } from '../types';

interface DatabaseModuleProps {
  adminData: AdminState | null;
  onRefresh: () => void;
  loading: boolean;
}

export const DatabaseModule: React.FC<DatabaseModuleProps> = ({
  adminData,
  onRefresh,
  loading
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-ink-850 p-5 rounded-3xl border border-paper-300 dark:border-ink-800 shadow-soft-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-sage-600 dark:text-sage-400" />
              Upstash Redis Cloud Storage
            </h2>
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
              Serverless key-value database persisting device push subscriptions and custom reminders.
            </p>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-xl text-ink-600 dark:text-ink-400 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors tap-bounce"
            title="Refresh database stats"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-paper-50 dark:bg-ink-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
              Connection Status
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  adminData?.env.redisConfigured ? 'bg-emerald-500' : 'bg-red-500'
                }`}
              />
              <span className="font-bold text-sm text-ink-900 dark:text-white">
                {adminData?.env.redisConfigured ? 'Connected & Operational' : 'Not Connected'}
              </span>
            </div>
            <p className="text-[11px] text-ink-500 dark:text-ink-400">
              REST API protocol (Free tier: 10,000 requests/day)
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-paper-50 dark:bg-ink-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
              Push Subscriptions Set
            </span>
            <div className="font-mono font-bold text-sm text-ink-900 dark:text-white">
              {adminData?.subscriberCount ?? 0} Active Devices
            </div>
            <p className="text-[11px] text-ink-500 dark:text-ink-400">
              Redis Key: <code className="font-mono">maamulat_push_subscriptions</code>
            </p>
          </div>
        </div>

        {/* Sample Subscribed Endpoints */}
        {adminData?.subscribersSample && adminData.subscribersSample.length > 0 ? (
          <div className="space-y-2 pt-2 border-t border-paper-200 dark:border-ink-800">
            <span className="text-xs font-bold text-ink-900 dark:text-white flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
              Connected Gateway Providers Sample:
            </span>
            <div className="space-y-1.5 font-mono text-[11px]">
              {adminData.subscribersSample.map((s, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-paper-100 dark:bg-ink-800 flex items-center justify-between text-ink-600 dark:text-ink-300"
                >
                  <span className="truncate">{s.endpoint}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-ink-700 text-ink-500 shrink-0 ml-2">
                    {s.domain}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-paper-50 dark:bg-ink-800 text-xs text-ink-500 dark:text-ink-400">
            No devices currently registered in Redis. When users toggle Daily Reminders in the app, their tokens will be saved here automatically.
          </div>
        )}
      </div>
    </div>
  );
};
