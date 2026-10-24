import React, { useState } from 'react';
import {
  Smartphone,
  Server,
  Radio,
  Sparkles,
  RotateCw,
  Send,
  BellRing,
  Clock
} from 'lucide-react';
import type { AdminState } from '../types';
import { parseJsonResponse } from '../../../utils/apiUtils';
import { BroadcastTab } from './notifications/BroadcastTab';
import { RemindersTab } from './notifications/RemindersTab';
import { ScheduleTab } from './notifications/ScheduleTab';

interface NotificationsModuleProps {
  adminData: AdminState | null;
  pin: string;
  onRefresh: () => Promise<any> | any;
}


export const NotificationsModule: React.FC<NotificationsModuleProps> = ({
  adminData,
  pin,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'broadcast' | 'reminders' | 'schedule'>('broadcast');

  // Manual Trigger Cron Test
  const [isTriggeringCron, setIsTriggeringCron] = useState(false);
  const [triggerCronResult, setTriggerCronResult] = useState<string | null>(null);

  const remindersList = adminData?.reminders || [];

  // Trigger Today's Scheduled Cron Immediately
  const handleTriggerCronNow = async () => {
    setIsTriggeringCron(true);
    setTriggerCronResult(null);

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin
        },
        body: JSON.stringify({
          action: 'trigger-cron',
          pin
        })
      });
      const data = await parseJsonResponse(res, 'Failed triggering scheduled reminder');

      if (res.ok) {
        setTriggerCronResult(`✅ Cron executed! Delivered to ${data.sentCount} device(s).`);
        await onRefresh();
      } else {
        setTriggerCronResult(`❌ Error: ${data.error || 'Failed triggering cron'}`);
      }
    } catch (err: any) {
      setTriggerCronResult(`❌ Error: ${err.message}`);
    } finally {
      setIsTriggeringCron(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-800 shadow-soft-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-500 dark:text-ink-400">
            <span>Subscribed Devices</span>
            <Smartphone className="w-4 h-4 text-sage-600 dark:text-sage-400" />
          </div>
          <div className="text-2xl font-bold text-ink-900 dark:text-white">
            {adminData?.subscriberCount ?? 0}
          </div>
          <p className="text-[11px] text-ink-500 dark:text-ink-400">
            Registered device sessions worldwide
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-800 shadow-soft-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-500 dark:text-ink-400">
            <span>Upstash Redis</span>
            <Server className="w-4 h-4 text-sage-600 dark:text-sage-400" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                adminData?.env.redisConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="text-sm font-bold text-ink-900 dark:text-white">
              {adminData?.env.redisConfigured ? 'Connected' : 'Missing Env'}
            </span>
          </div>
          <p className="text-[11px] text-ink-500 dark:text-ink-400 truncate">
            {adminData?.env.redisConfigured ? 'Subscriber storage ready' : 'Configure in Vercel Storage'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-800 shadow-soft-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-500 dark:text-ink-400">
            <span>VAPID Keys</span>
            <Radio className="w-4 h-4 text-sage-600 dark:text-sage-400" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                adminData?.env.vapidConfigured ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm font-bold text-ink-900 dark:text-white">
              {adminData?.env.vapidConfigured ? 'Configured' : 'Missing VAPID'}
            </span>
          </div>
          <p className="text-[11px] text-ink-500 dark:text-ink-400 truncate">
            {adminData?.env.vapidConfigured ? 'Push dispatch ready' : 'Set VAPID in Vercel Settings'}
          </p>
        </div>
      </div>

      {/* Quick Production Test / Trigger */}
      <div className="p-4 rounded-2xl bg-sage-50/80 dark:bg-sage-950/40 border border-sage-200 dark:border-sage-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-sage-900 dark:text-sage-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
            Test Production Push Delivery
          </span>
          <p className="text-xs text-sage-800 dark:text-ink-300">
            Dispatches today’s scheduled 9:00 PM reminder immediately to verify subscriber delivery.
          </p>
        </div>
        <button
          onClick={handleTriggerCronNow}
          disabled={isTriggeringCron}
          className="px-3.5 py-1.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs transition-colors tap-bounce shrink-0 shadow-sm disabled:opacity-50 flex items-center gap-1.5"
        >
          {isTriggeringCron ? (
            <RotateCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          Trigger Today’s Reminder Now
        </button>
      </div>

      {triggerCronResult && (
        <div className="p-3 rounded-xl bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-800 text-xs font-medium">
          {triggerCronResult}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-paper-300 dark:border-ink-800 pb-2">
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all tap-bounce flex items-center gap-1.5 ${
            activeTab === 'broadcast'
              ? 'bg-sage-600 text-white shadow-soft-sm'
              : 'text-ink-600 dark:text-ink-400 hover:bg-paper-100 dark:hover:bg-ink-800'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          Instant Broadcast
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all tap-bounce flex items-center gap-1.5 ${
            activeTab === 'reminders'
              ? 'bg-sage-600 text-white shadow-soft-sm'
              : 'text-ink-600 dark:text-ink-400 hover:bg-paper-100 dark:hover:bg-ink-800'
          }`}
        >
          <BellRing className="w-3.5 h-3.5" />
          Manage Reminders ({remindersList.length})
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all tap-bounce flex items-center gap-1.5 ${
            activeTab === 'schedule'
              ? 'bg-sage-600 text-white shadow-soft-sm'
              : 'text-ink-600 dark:text-ink-400 hover:bg-paper-100 dark:hover:bg-ink-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Schedule & Logs
        </button>
      </div>

      {/* TAB 1: Instant Worldwide Broadcast */}
      {activeTab === 'broadcast' && (
        <BroadcastTab adminData={adminData} pin={pin} onRefresh={onRefresh} />
      )}

      {/* TAB 2: Reminders Rotation */}
      {activeTab === 'reminders' && (
        <RemindersTab
          remindersList={remindersList}
          subscriberCount={adminData?.subscriberCount ?? 0}
          pin={pin}
          onRefresh={onRefresh}
        />
      )}

      {/* TAB 3: Schedule & Logs */}
      {activeTab === 'schedule' && <ScheduleTab adminData={adminData} />}
    </div>
  );
};
