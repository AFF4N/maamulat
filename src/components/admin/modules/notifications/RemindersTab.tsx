import React, { useState } from 'react';
import {
  Undo2,
  Plus,
  RotateCw,
  Pencil,
  X,
  Check,
  Star,
  Send,
  Trash2
} from 'lucide-react';
import type { ReminderItem } from '../../types';
import { parseJsonResponse } from '../../../../utils/apiUtils';

interface RemindersTabProps {
  remindersList: ReminderItem[];
  subscriberCount: number;
  pin: string;
  onRefresh: () => Promise<any> | any;
}


export const RemindersTab: React.FC<RemindersTabProps> = ({
  remindersList,
  subscriberCount,
  pin,
  onRefresh
}) => {
  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; body: string; url: string }>({
    title: '',
    body: '',
    url: ''
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  // New reminder form
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newUrl, setNewUrl] = useState('/?action=missing-reports');
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [sendingReminderIdx, setSendingReminderIdx] = useState<number | null>(null);

  const handleStartEditing = (item: ReminderItem) => {
    setEditingId(item.id || null);
    setEditForm({
      title: item.title,
      body: item.body,
      url: item.url || '/?action=missing-reports'
    });
  };

  const handleCancelEditing = () => {
    setEditingId(null);
    setEditForm({ title: '', body: '', url: '' });
  };

  const handleSaveEdit = async (item: ReminderItem, idx: number) => {
    if (!editForm.title.trim() || !editForm.body.trim()) {
      alert('Reminder title and body cannot be empty.');
      return;
    }
    setIsSavingEdit(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin
        },
        body: JSON.stringify({
          action: 'update-reminder',
          pin,
          index: idx,
          reminder: {
            id: item.id,
            title: editForm.title.trim(),
            body: editForm.body.trim(),
            url: editForm.url.trim() || '/?action=missing-reports',
            isDefault: item.isDefault
          }
        })
      });
      const data = await parseJsonResponse(res, 'Failed updating reminder in cloud.');
      if (res.ok) {
        setEditingId(null);
        await onRefresh();
      } else {
        alert(data.error || 'Failed updating reminder');
      }
    } catch (e: any) {
      alert(`Network error: ${e.message}`);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleAddReminder = async () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    setIsAddingReminder(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin
        },
        body: JSON.stringify({
          action: 'add-reminder',
          pin,
          reminder: {
            title: newTitle.trim(),
            body: newBody.trim(),
            url: newUrl.trim() || '/?action=missing-reports'
          }
        })
      });
      const data = await parseJsonResponse(res, 'Failed adding reminder to cloud.');
      if (res.ok) {
        setNewTitle('');
        setNewBody('');
        setNewUrl('/?action=missing-reports');
        await onRefresh();
      } else {
        alert(data.error || 'Failed adding reminder');
      }
    } catch (e: any) {
      alert(`Network error: ${e.message}`);
    } finally {
      setIsAddingReminder(false);
    }
  };

  const handleDeleteReminder = async (item: ReminderItem, idx: number) => {
    if (remindersList.length <= 1) {
      alert('You must keep at least one reminder in the cloud.');
      return;
    }
    const ok = window.confirm(`Delete "${item.title}" from cloud database?`);
    if (!ok) return;

    setActionInProgressId(item.id || `idx_${idx}`);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin
        },
        body: JSON.stringify({
          action: 'delete-reminder',
          pin,
          id: item.id,
          index: idx
        })
      });
      const data = await parseJsonResponse(res, 'Failed deleting reminder from cloud.');
      if (res.ok) {
        if (editingId === item.id) setEditingId(null);
        await onRefresh();
      } else {
        alert(data.error || 'Failed deleting reminder');
      }
    } catch (e: any) {
      alert(`Network error: ${e.message}`);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleSetAsDefault = async (item: ReminderItem, idx: number) => {
    setActionInProgressId(item.id || `idx_${idx}`);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin
        },
        body: JSON.stringify({
          action: 'set-default-reminder',
          pin,
          id: item.id,
          index: idx
        })
      });
      const data = await parseJsonResponse(res, 'Failed setting default reminder in cloud.');
      if (res.ok) {
        await onRefresh();
      } else {
        alert(data.error || 'Failed updating default reminder');
      }
    } catch (e: any) {
      alert(`Network error: ${e.message}`);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleResetReminders = async () => {
    const ok = window.confirm('Reset all cloud reminders back to the default curated Islamic collection?');
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
      const data = await parseJsonResponse(res, 'Failed to reset reminders in cloud.');
      if (res.ok) {
        setEditingId(null);
        await onRefresh();
      } else {
        alert(data.error || 'Failed resetting reminders');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSendSpecificReminder = async (item: ReminderItem, idx: number) => {
    const ok = window.confirm(
      `Broadcast "${item.title}" now to all ${subscriberCount} subscribed device(s)?`
    );
    if (!ok) return;

    setSendingReminderIdx(idx);
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
          title: item.title,
          body: item.body,
          url: item.url || '/?action=missing-reports'
        })
      });
      const data = await parseJsonResponse(res, 'Failed to dispatch notification');
      if (res.ok) {
        alert(`✅ Sent! Delivered to ${data.sentCount} device(s).`);
        await onRefresh();
      } else {
        alert(`❌ Error: ${data.error || 'Failed sending reminder'}`);
      }
    } catch (e: any) {
      alert(`Network error: ${e.message}`);
    } finally {
      setSendingReminderIdx(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-ink-850 p-4 rounded-2xl border border-paper-300 dark:border-ink-800 shadow-soft-sm">
        <div>
          <h2 className="text-sm font-bold text-ink-900 dark:text-white">
            Scheduled Reminders Rotation
          </h2>
          <p className="text-xs text-ink-500 dark:text-ink-400">
            Managed directly in your cloud database (Upstash Redis). Any edit or default change is live immediately.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetReminders}
            className="px-3 py-1.5 rounded-xl border border-paper-300 dark:border-ink-700 text-xs font-semibold text-ink-600 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors tap-bounce flex items-center gap-1.5"
            title="Reset all reminders back to the curated default Hadith & Dua rotation"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Reset to Defaults
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-ink-850 p-4 rounded-2xl border border-paper-300 dark:border-ink-800 shadow-soft-sm space-y-3">
        <span className="text-xs font-bold text-ink-900 dark:text-white flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-sage-600 dark:text-sage-400" />
          Add New Reminder to Rotation
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          <input
            type="text"
            placeholder="URL (e.g. /?action=missing-reports)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="text-xs font-mono px-3 py-2 rounded-xl border border-paper-300 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-ink-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sage-500"
          />
        </div>
        <button
          type="button"
          onClick={handleAddReminder}
          disabled={isAddingReminder || !newTitle.trim() || !newBody.trim()}
          className="px-3.5 py-1.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-xs font-bold text-white transition-colors tap-bounce shadow-sm disabled:opacity-50 flex items-center gap-1.5"
        >
          {isAddingReminder ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Adding to Cloud...</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Cloud Rotation</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-2.5">
        {remindersList.map((item, idx) => {
          const isDefault = Boolean(item.isDefault);
          const isEditing = editingId === (item.id || `rem_${idx}`);
          const itemActionKey = item.id || `idx_${idx}`;
          const isActionInProgress = actionInProgressId === itemActionKey;

          if (isEditing) {
            return (
              <div
                key={item.id || idx}
                className="p-4 rounded-2xl bg-white dark:bg-ink-850 border border-sage-500/60 shadow-soft-md space-y-3 transition-all"
              >
                <div className="flex items-center justify-between pb-1 border-b border-paper-200 dark:border-ink-800">
                  <span className="text-xs font-bold text-sage-700 dark:text-sage-300 flex items-center gap-1.5">
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Reminder #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={handleCancelEditing}
                    disabled={isSavingEdit}
                    className="p-1 rounded-lg text-ink-400 hover:text-ink-700 dark:hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1">
                      Reminder Title
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-paper-300 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-ink-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sage-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1">
                      Message Body (Urdu, Arabic, or English)
                    </label>
                    <textarea
                      rows={3}
                      value={editForm.body}
                      onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-paper-300 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-ink-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sage-500 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1">
                      Destination URL
                    </label>
                    <input
                      type="text"
                      value={editForm.url}
                      onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                      placeholder="/?action=missing-reports"
                      className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-paper-300 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-ink-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sage-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCancelEditing}
                      disabled={isSavingEdit}
                      className="px-3 py-1.5 rounded-xl border border-paper-300 dark:border-ink-700 text-xs font-semibold text-ink-600 dark:text-ink-400 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(item, idx)}
                      disabled={isSavingEdit || !editForm.title.trim() || !editForm.body.trim()}
                      className="px-3.5 py-1.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold transition-all tap-bounce shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSavingEdit ? (
                        <>
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Save to Cloud</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.id || idx}
              className={`p-4 rounded-2xl bg-white dark:bg-ink-850 border shadow-soft-sm flex flex-col sm:flex-row sm:items-start justify-between gap-3 group transition-all ${
                isDefault
                  ? 'border-amber-300/80 dark:border-amber-700/60 ring-1 ring-amber-400/30 dark:ring-amber-500/20'
                  : 'border-paper-300 dark:border-ink-800'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className="w-6 h-6 rounded-lg bg-paper-100 dark:bg-ink-800 text-[10px] font-bold text-ink-600 dark:text-ink-400 flex items-center justify-center shrink-0 mt-0.5">
                  #{idx + 1}
                </span>
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-ink-900 dark:text-white">
                      {item.title}
                    </span>
                    {isDefault ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center gap-1 shrink-0 animate-in fade-in duration-200">
                        <Star className="w-3 h-3 fill-current text-amber-500" />
                        Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetAsDefault(item, idx)}
                        disabled={isActionInProgress}
                        className="text-[10px] text-ink-400 hover:text-amber-600 dark:hover:text-amber-400 font-semibold transition-colors underline decoration-dotted flex items-center gap-1 disabled:opacity-50"
                        title="Set as the active default reminder in cloud"
                      >
                        {isActionInProgress ? (
                          <>
                            <RotateCw className="w-2.5 h-2.5 animate-spin text-amber-500" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          'Set as Default'
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-ink-600 dark:text-ink-300 leading-snug">
                    {item.body}
                  </p>
                  {item.url && item.url !== '/?action=missing-reports' && (
                    <div className="pt-0.5">
                      <span className="text-[10px] font-mono text-ink-400 dark:text-ink-500 bg-paper-100 dark:bg-ink-800 px-1.5 py-0.5 rounded">
                        Opens: {item.url}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-start pt-1 sm:pt-0">
                <button
                  type="button"
                  onClick={() => handleSendSpecificReminder(item, idx)}
                  disabled={sendingReminderIdx === idx}
                  title="Send this specific reminder now to all devices worldwide"
                  className="px-2.5 py-1.5 rounded-xl bg-sage-50 hover:bg-sage-100 dark:bg-sage-950/50 dark:hover:bg-sage-900/60 text-sage-700 dark:text-sage-300 text-xs font-bold transition-all tap-bounce flex items-center gap-1.5 border border-sage-200/60 dark:border-sage-800/40 disabled:opacity-50"
                >
                  {sendingReminderIdx === idx ? (
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Send Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartEditing(item)}
                  title="Edit this reminder"
                  className="p-1.5 rounded-lg text-ink-400 hover:text-sage-600 dark:hover:text-sage-400 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors opacity-80 group-hover:opacity-100 shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteReminder(item, idx)}
                  disabled={isActionInProgress}
                  title="Delete reminder"
                  className="p-1.5 rounded-lg text-ink-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors opacity-70 group-hover:opacity-100 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
