import React, { useState } from 'react';
import { Send, RotateCw } from 'lucide-react';
import type { AdminState } from '../../types';
import { parseJsonResponse } from '../../../../utils/apiUtils';

interface BroadcastTabProps {
  adminData: AdminState | null;
  pin: string;
  onRefresh: () => Promise<any> | any;
}


export const BroadcastTab: React.FC<BroadcastTabProps> = ({ adminData, pin, onRefresh }) => {
  const [broadcastTitle, setBroadcastTitle] = useState('معمولات | پیغام 🌙');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastUrl, setBroadcastUrl] = useState('/?action=missing-reports');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);

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
      const data = await parseJsonResponse(res, 'Failed to dispatch broadcast');

      if (res.ok) {
        setBroadcastResult(
          `✅ Sent to ${data.sentCount} device(s)! (${data.failedCount} failed, ${data.prunedCount} pruned)`
        );
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

  return (
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
            Tapping this notification directly opens:{' '}
            <code className="bg-paper-100 dark:bg-ink-800 px-1 py-0.5 rounded text-[10px]">
              {broadcastUrl}
            </code>
            .
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
  );
};
