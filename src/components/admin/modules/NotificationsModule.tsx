import React, { useState } from 'react';
import {
  Smartphone,
  Server,
  Radio,
  Sparkles,
  RotateCw,
  Send,
  BellRing,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Undo2
} from 'lucide-react';
import type { AdminState, ReminderItem } from '../types';

interface NotificationsModuleProps {
  adminData: AdminState | null;
  pin: string;
  onRefresh: () => void;
}

export const NotificationsModule: React.FC<NotificationsModuleProps> = ({
  adminData,
  pin,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'broadcast' | 'reminders' | 'schedule'>('broadcast');

  // Broadcast Form
  const [broadcastTitle, setBroadcastTitle] = useState('معمولات | پیغام 🌙');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastUrl, setBroadcastUrl] = useState('/?action=missing-reports');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);

  // Manual Trigger Cron
  const [isTriggeringCron, setIsTriggeringCron] = useState(false);
  const [triggerCronResult, setTriggerCronResult] = useState<string | null>(null);

  // Reminder Management
  const [editingReminders, setEditingReminders] = useState<ReminderItem[]>(() => adminData?.reminders || []);
  const [hasReminderChanges, setHasReminderChanges] = useState(false);
  const [isSavingReminders, setIsSavingReminders] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

  // Sync reminders if adminData updates externally
  React.useEffect(() => {
    if (adminData?.reminders && !hasReminderChanges) {
      setEditingReminders(adminData.reminders);
    }
  }, [adminData?.reminders, hasReminderChanges]);

  // Send Worldwide Broadcast
  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
      alert('Please fill out both the title and body for the broadcast notification.');
      return;
    }

    const confirmCount = adminData?.subscriberCount || 0;
    const ok = window.confirm(
      `Broadcast this push notification to all ${confirmCount} subscribed device(s) worldwide?`
    );
    if (!ok) return;

    setIsBroadcasting(true);
    setBroadcastResult(null);

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin
        },
        body: JSON.stringify({
          action: 'broadcast',
          pin,
          title: broadcastTitle,
          body: broadcastBody,
          url: broadcastUrl
        })
      });
      const data = await res.json();

      if (res.ok) {
        setBroadcastResult(`✅ Sent to ${data.sentCount} device(s)! (${data.failedCount} failed, ${data.prunedCount} pruned)`);
        setBroadcastBody('');
        onRefresh();
      } else {
        setBroadcastResult(`❌ Error: ${data.error || 'Failed to dispatch broadcast'}`);
      }
    } catch (err: any) {
      setBroadcastResult(`❌ Network Error: ${err.message}`);
    } finally {
      setIsBroadcasting(false);
    }
  };

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
      const data = await res.json();

      if (res.ok) {
        setTriggerCronResult(`✅ Cron executed! Delivered to ${data.sentCount} device(s).`);
        onRefresh();
      } else {
        setTriggerCronResult(`❌ Error: ${data.error || 'Failed triggering cron'}`);
      }
    } catch (err: any) {
      setTriggerCronResult(`❌ Error: ${err.message}`);
    } finally {
      setIsTriggeringCron(false);
    }
  };

  // Reminder modifications
  const handleAddReminder = () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    setEditingReminders([
      ...editingReminders,
      {
        title: newTitle.trim(),
        body: newBody.trim(),
        url: '/?action=missing-reports'
      }
    ]);
    setNewTitle('');
    setNewBody('');
    setHasReminderChanges(true);
  };

  const handleDeleteReminder = (index: number) => {
    const updated = editingReminders.filter((_, i) => i !== index);
    setEditingReminders(updated);
    setHasReminderChanges(true);
  };

  const handleSaveReminders = async () => {
    if (editingReminders.length === 0) {
      alert('Reminders list cannot be empty.');
      return;
    }

    setIsSavingReminders(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin
        },
        body: JSON.stringify({
          action: 'save-reminders',
          pin,
          reminders: editingReminders
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Custom reminders saved to cloud database!');
        setHasReminderChanges(false);
        onRefresh();
      } else {
        alert(data.error || 'Failed saving reminders.');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving reminders');
    } finally {
      setIsSavingReminders(false);
    }
  };

  const handleResetReminders = async () => {
    const ok = window.confirm('Reset all reminders back to the default curated Islamic collection?');
    if (!ok) return;

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin
        },
        body: JSON.stringify({ action: 'reset-reminders', pin })
      });
      if (res.ok) {
        alert('Reset to default reminders successfully.');
        onRefresh();
      }
    } catch (e: any) {
      alert(e.message);
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
          Manage Reminders ({editingReminders.length})
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-800 rounded-3xl p-5 shadow-soft-sm space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-ink-900 dark:text-white">
                Send Push Broadcast Worldwide
              </h2>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                Dispatches an immediate notification to all {adminData?.subscriberCount ?? 0} active device(s).
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. معمولات | اعلانِ خاص 🌙"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-paper-300 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                  Message Body
                </label>
                <textarea
                  rows={4}
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  placeholder="Type your message here... Supports Urdu, Arabic, and English."
                  className="w-full text-sm px-3 py-2 rounded-xl border border-paper-300 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                  Destination URL
                </label>
                <input
                  type="text"
                  value={broadcastUrl}
                  onChange={(e) => setBroadcastUrl(e.target.value)}
                  placeholder="/?action=missing-reports"
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-paper-300 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500"
                />
              </div>

              {broadcastResult && (
                <div className="p-3 rounded-xl bg-paper-100 dark:bg-ink-800 text-xs font-medium">
                  {broadcastResult}
                </div>
              )}

              <button
                type="button"
                onClick={handleSendBroadcast}
                disabled={isBroadcasting || !broadcastBody.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-sm transition-colors tap-bounce shadow-soft-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isBroadcasting ? (
                  <RotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Broadcast to All {adminData?.subscriberCount ?? 0} Device(s)
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-800 rounded-3xl p-5 shadow-soft-sm space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                Mobile Push Preview
              </span>

              <div className="p-3.5 rounded-2xl bg-paper-100 dark:bg-ink-800 border border-paper-200 dark:border-ink-700 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-sage-600 text-white flex items-center justify-center text-[9px] font-bold">
                      🌿
                    </div>
                    <span className="text-[11px] font-bold text-ink-900 dark:text-white">
                      Maamulat · معمولات
                    </span>
                  </div>
                  <span className="text-[10px] text-ink-400">now</span>
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-ink-900 dark:text-white">
                    {broadcastTitle || 'Notification Title'}
                  </h3>
                  <p className="text-xs text-ink-700 dark:text-ink-300 leading-snug">
                    {broadcastBody || 'Preview message text will appear here...'}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-ink-500 dark:text-ink-400">
                Tapping this notification directly opens: <code className="bg-paper-100 dark:bg-ink-800 px-1 py-0.5 rounded text-[10px]">{broadcastUrl}</code>.
              </p>
            </div>

            {adminData?.lastBroadcastLog && (
              <div className="p-4 rounded-2xl bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-800 shadow-soft-sm space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  Last Broadcast Log
                </span>
                <div className="text-xs font-bold text-ink-900 dark:text-white">
                  {adminData.lastBroadcastLog.title}
                </div>
                <p className="text-xs text-ink-600 dark:text-ink-400">
                  {adminData.lastBroadcastLog.body}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-ink-400 pt-1">
                  <span>{new Date(adminData.lastBroadcastLog.timestamp).toLocaleString()}</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-semibold">
                    {adminData.lastBroadcastLog.sentCount} delivered
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Reminders Rotation */}
      {activeTab === 'reminders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-ink-850 p-4 rounded-2xl border border-paper-300 dark:border-ink-800 shadow-soft-sm">
            <div>
              <h2 className="text-sm font-bold text-ink-900 dark:text-white">
                Scheduled Reminders Rotation
              </h2>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                {adminData?.isUsingCustomReminders
                  ? 'Using custom reminders stored in your cloud database.'
                  : 'Currently using the curated default Islamic Duas and Hadiths.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {hasReminderChanges && (
                <button
                  onClick={handleSaveReminders}
                  disabled={isSavingReminders}
                  className="px-3.5 py-1.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs transition-colors tap-bounce shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              )}
              {adminData?.isUsingCustomReminders && (
                <button
                  onClick={handleResetReminders}
                  className="px-3 py-1.5 rounded-xl border border-paper-300 dark:border-ink-700 text-xs font-semibold text-ink-600 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors tap-bounce flex items-center gap-1.5"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  Reset to Defaults
                </button>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-ink-850 p-4 rounded-2xl border border-paper-300 dark:border-ink-800 shadow-soft-sm space-y-3">
            <span className="text-xs font-bold text-ink-900 dark:text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-sage-600 dark:text-sage-400" />
              Add New Reminder to Rotation
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Title (e.g. فرمانِ نبوی ﷺ | فضیلت)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-paper-300 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-ink-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sage-500"
              />
              <input
                type="text"
                placeholder="Body (Dua, Hadith, or habit reminder)"
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-paper-300 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-ink-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sage-500"
              />
            </div>
            <button
              type="button"
              onClick={handleAddReminder}
              disabled={!newTitle.trim() || !newBody.trim()}
              className="px-3 py-1.5 rounded-xl bg-paper-100 hover:bg-paper-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-xs font-bold text-ink-800 dark:text-ink-200 transition-colors tap-bounce disabled:opacity-50"
            >
              + Add to List
            </button>
          </div>

          <div className="space-y-2.5">
            {editingReminders.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-800 shadow-soft-sm flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-paper-100 dark:bg-ink-800 text-[10px] font-bold text-ink-600 dark:text-ink-400 flex items-center justify-center shrink-0 mt-0.5">
                    #{idx + 1}
                  </span>
                  <div className="space-y-1 min-w-0">
                    <div className="text-xs font-bold text-ink-900 dark:text-white truncate">
                      {item.title}
                    </div>
                    <p className="text-xs text-ink-600 dark:text-ink-300 leading-snug">
                      {item.body}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteReminder(idx)}
                  title="Delete reminder"
                  className="p-1.5 rounded-lg text-ink-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors opacity-70 group-hover:opacity-100 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Schedule & Logs */}
      {activeTab === 'schedule' && (
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
      )}
    </div>
  );
};
