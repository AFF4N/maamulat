import React from 'react';
import { Database, RefreshCw, Smartphone } from 'lucide-react';
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

        {/* Connected Subscribed Devices List */}
        {adminData?.subscribersSample && adminData.subscribersSample.length > 0 ? (
          <div className="space-y-3 pt-3 border-t border-paper-200 dark:border-ink-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink-900 dark:text-white flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
                Registered Devices & Push Gateways ({adminData.subscribersSample.length}):
              </span>
              <span className="text-[11px] text-ink-400">
                Encrypted anonymous tokens
              </span>
            </div>

            <div className="space-y-2">
              {adminData.subscribersSample.map((s, i) => {
                const isGoogle = s.platform?.includes('Google') || s.domain?.includes('googleapis');
                const isApple = s.platform?.includes('Apple') || s.domain?.includes('apple');
                const isFirefox = s.platform?.includes('Mozilla') || s.domain?.includes('mozilla');

                return (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-paper-100/70 dark:bg-ink-800/80 border border-paper-200 dark:border-ink-750 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-white dark:bg-ink-700 border border-paper-200 dark:border-ink-600 flex items-center justify-center shrink-0">
                        <Smartphone className="w-3.5 h-3.5 text-ink-600 dark:text-ink-300" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isGoogle
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : isApple
                                ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300'
                                : isFirefox
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                : 'bg-paper-200 dark:bg-ink-700 text-ink-700 dark:text-ink-200'
                            }`}
                          >
                            {s.platform || 'Web Push Device'}
                          </span>
                          <span className="text-[10px] text-ink-400 font-mono hidden sm:inline">
                            {s.domain}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-ink-500 dark:text-ink-400 truncate mt-0.5">
                          {s.endpoint}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-paper-50 dark:bg-ink-800 text-xs text-ink-500 dark:text-ink-400 text-center">
            No devices currently registered in Redis. When users toggle Daily Reminders in the app, their tokens will appear here automatically.
          </div>
        )}
      </div>
    </div>
  );
};
