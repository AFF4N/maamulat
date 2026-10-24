import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import type { AdminState } from '../types';

interface SystemModuleProps {
  adminData: AdminState | null;
}

export const SystemModule: React.FC<SystemModuleProps> = ({ adminData }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-ink-850 p-5 rounded-3xl border border-paper-300 dark:border-ink-800 shadow-soft-sm space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sage-600 dark:text-sage-400" />
          <div>
            <h2 className="text-sm font-bold text-ink-900 dark:text-white">
              Environment & Security Status
            </h2>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              Zero secrets are stored in Git. All credentials are pure environment variables.
            </p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs">
          {/* ADMIN_PIN */}
          <div className="p-3 rounded-xl bg-paper-50 dark:bg-ink-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-ink-900 dark:text-white">ADMIN_PIN Passcode</div>
              <div className="text-[11px] text-ink-500 dark:text-ink-400">
                Mandatory secret PIN configured in Vercel project environment
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Configured
            </span>
          </div>

          {/* Upstash Redis */}
          <div className="p-3 rounded-xl bg-paper-50 dark:bg-ink-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-ink-900 dark:text-white">Vercel KV / Redis REST Credentials</div>
              <div className="text-[11px] text-ink-500 dark:text-ink-400">
                KV_REST_API_URL and KV_REST_API_TOKEN
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                adminData?.env.redisConfigured
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                  : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
              }`}
            >
              {adminData?.env.redisConfigured ? (
                <>
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" /> Missing
                </>
              )}
            </span>
          </div>

          {/* VAPID Keys */}
          <div className="p-3 rounded-xl bg-paper-50 dark:bg-ink-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-ink-900 dark:text-white">VAPID Cryptographic Keys</div>
              <div className="text-[11px] text-ink-500 dark:text-ink-400">
                RFC 8292 Application Server Keys (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                adminData?.env.vapidConfigured
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                  : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
              }`}
            >
              {adminData?.env.vapidConfigured ? (
                <>
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" /> Missing
                </>
              )}
            </span>
          </div>

          {/* CRON_SECRET */}
          <div className="p-3 rounded-xl bg-paper-50 dark:bg-ink-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-ink-900 dark:text-white">Cron Authorization</div>
              <div className="text-[11px] text-ink-500 dark:text-ink-400">
                Optional CRON_SECRET header verification for automated invocations
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-paper-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300">
              {adminData?.env.cronSecretConfigured ? 'Custom Header Set' : 'Default Vercel Header'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
