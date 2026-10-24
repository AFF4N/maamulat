import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  SlidersHorizontal,
  Sun,
  Moon,
  Target,
  RotateCcw,
  Download,
  Upload,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  RefreshCw,
  HeartHandshake,
  Plus,
  Minus,
  Check,
  Bell,
  BellRing,
} from 'lucide-react';
import type { MaamulatState } from '../types';
import { formatUrduHijriDate } from '../utils/dateUtils';
import { exportBackupJSON, validateBackupJSON, readUploadedFileAsText } from '../utils/backupUtils';
import {
  isPushNotificationSupported,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  checkIsSubscribed
} from '../utils/notificationUtils';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCustomize: () => void;
  onNavigateToAdmin?: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  goalDay: number;
  goalMaxDays: number;
  onOpenEditGoal: () => void;
  state?: MaamulatState;
  onResetToday?: () => void;
  onResetToDefault?: () => void;
  onUpdateMurrabiContact?: (contact: string) => void;
  onUpdateHijriAdjustment?: (adjustment: number) => void;
  onRestoreBackup?: (backup: MaamulatState) => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToCustomize,
  onNavigateToAdmin,
  isDark,
  onToggleTheme,
  goalDay,
  goalMaxDays,
  onOpenEditGoal,
  state,
  onResetToday,
  onResetToDefault,
  onUpdateMurrabiContact,
  onUpdateHijriAdjustment,
  onRestoreBackup,
}) => {
  const [murrabiInput, setMurrabiInput] = useState(state?.murrabiContact || '');
  const [isMurrabiSaved, setIsMurrabiSaved] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Push notifications state
  const [isPushSupported] = useState(() => isPushNotificationSupported());
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    checkIsSubscribed().then((subscribed) => {
      if (isMounted) {
        setIsPushEnabled(subscribed);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleTogglePush = async () => {
    setPushLoading(true);
    try {
      if (isPushEnabled) {
        await unsubscribeFromPushNotifications();
        setIsPushEnabled(false);
      } else {
        const res = await subscribeToPushNotifications();
        if (res.success) {
          setIsPushEnabled(true);
        } else {
          alert(res.error || 'Permission denied for notifications.');
        }
      }
    } catch (err: any) {
      console.error(err);
      alert('Notification error: ' + (err?.message || 'Unknown error'));
    } finally {
      setPushLoading(false);
    }
  };


  const currentAdjustment = state?.hijriAdjustment ?? 0;
  const todayDateStr = state?.todayDate || '';
  const previewHijriUrdu = todayDateStr ? formatUrduHijriDate(todayDateStr, currentAdjustment) : '';

  // Sync murrabiInput when state.murrabiContact changes
  useEffect(() => {
    if (state?.murrabiContact !== undefined) {
      setMurrabiInput(state.murrabiContact || '');
    }
  }, [state?.murrabiContact]);

  const handleSaveMurrabi = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateMurrabiContact?.(murrabiInput);
    setIsMurrabiSaved(true);
    setTimeout(() => setIsMurrabiSaved(false), 2000);
  };
  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleExportJSON = async () => {
    if (!state) return;
    try {
      const result = await exportBackupJSON(state);
      if (result.success) {
        if (!result.cancelled) {
          const msg =
            result.method === 'share'
              ? 'Saved to Files!'
              : result.method === 'copy'
              ? 'Copied to Clipboard!'
              : 'Backup Downloaded!';
          setExportStatus(msg);
          setTimeout(() => setExportStatus(null), 2500);
        }
      } else {
        alert(result.error || 'Failed to export backup.');
      }
    } catch (err) {
      console.error('Export error', err);
    }
  };

  const handleRestoreClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const rawText = await readUploadedFileAsText(file);
      const validation = validateBackupJSON(rawText);

      if (!validation.valid || !validation.state) {
        alert(validation.error || 'The chosen file is not a valid Maamulat backup file.');
        return;
      }

      const backup = validation.state;
      const backupDate = backup.todayDate || 'previous date';
      const historyCount = Array.isArray(backup.history) ? backup.history.length : 0;

      const confirmed = window.confirm(
        `Restore Maamulat backup (${backupDate})?\n\nThis will restore ${historyCount} past day records, custom tasks, and habits. Your current sheet will be updated.`
      );

      if (!confirmed) return;

      onRestoreBackup?.(backup);
      setRestoreStatus('Restored!');
      setTimeout(() => setRestoreStatus(null), 3000);
    } catch (err: any) {
      console.error('Failed to restore backup:', err);
      alert('Failed to read or restore backup file: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleConfirmResetToday = () => {
    if (window.confirm('Reset all task ticks for today? Your streak and previous history will be preserved.')) {
      onResetToday?.();
      onClose();
    }
  };

  const handleConfirmResetDefaults = () => {
    if (
      window.confirm(
        'Reset all tasks and sections back to original defaults? Any custom tasks will be replaced.'
      )
    ) {
      onResetToDefault?.();
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      />

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation & Settings Menu"
        className={`fixed top-0 right-0 bottom-0 z-50 w-[90vw] sm:w-full max-w-md bg-paper-50 dark:bg-ink-900 border-l border-paper-300 dark:border-ink-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out pb-6 standalone:pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 standalone:pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pb-4 border-b border-paper-200 dark:border-ink-800">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-sage-100 dark:bg-sage-950/60 text-sage-700 dark:text-sage-300 text-sm font-semibold border border-sage-200/80 dark:border-sage-800">
              🌿
            </span>
            <div>
              <h2 className="text-sm font-bold text-ink-900 dark:text-white leading-tight">
                Menu & Settings
              </h2>
              <p className="arabic-text text-xs text-sage-700 dark:text-ink-300 text-left">
                ترتیبات و تخصیص
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 rounded-full text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-white hover:bg-paper-200 dark:hover:bg-ink-800 transition-colors tap-bounce"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* 1. Customise Tasks Card */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Customization · تخصیص
            </span>
            <button
              onClick={() => {
                onClose();
                onNavigateToCustomize();
              }}
              className="w-full text-left p-3.5 rounded-2xl bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-800 hover:border-sage-400 dark:hover:border-sage-600 shadow-soft-sm space-y-2 transition-all tap-bounce group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-sage-100 dark:bg-sage-950/60 text-sage-700 dark:text-sage-300 flex items-center justify-center shrink-0">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-ink-900 dark:text-white block truncate">
                      Customize Maamulat
                    </span>
                    <span className="arabic-text text-[11px] text-sage-700 dark:text-ink-300 block truncate">
                      معمولات و اسباق کی تخصیص
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-400 dark:text-ink-500 group-hover:text-sage-600 dark:group-hover:text-sage-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
              </div>
              <p className="text-[11px] text-ink-600 dark:text-ink-400 leading-snug">
                Add, edit, reorder or hide daily tasks, prayers, and Hasanat rewards.
              </p>
            </button>
          </div>

          {/* 2. Murrabi & Accountability Partner */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Accountability Partner · مربی و احتساب
            </span>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-800 space-y-3 shadow-soft-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-sage-100 dark:bg-sage-950/60 text-sage-700 dark:text-sage-300 flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-ink-900 dark:text-white block truncate">
                      Murrabi Details (مربی کا رابطہ)
                    </span>
                    <span className="text-[10px] text-ink-500 dark:text-ink-400 block">
                      {state?.murrabiContact ? '✓ Linked for direct WhatsApp sending' : 'Add phone to send reports directly'}
                    </span>
                  </div>
                </div>
                {state?.murrabiContact && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shrink-0">
                    Linked
                  </span>
                )}
              </div>

              {/* Contact Input Form */}
              <form onSubmit={handleSaveMurrabi} className="space-y-1.5">
                <label className="text-[11px] font-semibold text-ink-700 dark:text-ink-300 block">
                  WhatsApp Number (with country code):
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={murrabiInput}
                    onChange={(e) => setMurrabiInput(e.target.value)}
                    placeholder="e.g. 923001234567 or +92 300..."
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-xl border border-paper-300 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-ink-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sage-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sage-600 hover:bg-sage-700 text-white transition-colors tap-bounce shrink-0"
                  >
                    {isMurrabiSaved ? 'Saved!' : 'Save'}
                  </button>
                </div>
                <p className="text-[10px] text-ink-500 dark:text-ink-400 leading-snug">
                  Adding your Murrabi's WhatsApp number lets you send your daily sheet directly to them with one tap. You can also copy or send the report anytime even without a number set.
                </p>
              </form>
            </div>
          </div>

          {/* 3. Theme / Appearance Mode Switcher */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Appearance · تھیم
            </span>
            <div className="p-3 rounded-2xl bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-800 flex items-center justify-between shadow-soft-sm">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-paper-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300">
                  {isDark ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-600" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-ink-900 dark:text-white block">
                    {isDark ? 'Dark Mode' : 'Light Mode'}
                  </span>
                  <span className="text-[11px] text-ink-500 dark:text-ink-400 block">
                    {isDark ? 'Comfortable night reading' : 'Clean daytime paper feel'}
                  </span>
                </div>
              </div>

              {/* Segmented Pill */}
              <div className="flex items-center bg-paper-100 dark:bg-ink-800 p-1 rounded-xl border border-paper-200 dark:border-ink-700">
                <button
                  type="button"
                  onClick={() => {
                    if (isDark) onToggleTheme();
                  }}
                  className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${!isDark
                    ? 'bg-white text-ink-900 shadow-sm'
                    : 'text-ink-500 hover:text-ink-800 dark:hover:text-ink-200'
                    }`}
                  aria-label="Set light mode"
                >
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[11px]">Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isDark) onToggleTheme();
                  }}
                  className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${isDark
                    ? 'bg-ink-700 text-white shadow-sm'
                    : 'text-ink-500 hover:text-ink-800 dark:hover:text-ink-200'
                    }`}
                  aria-label="Set dark mode"
                >
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px]">Dark</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3b. Push Reminders & Notifications */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Reminders & Duas · یاد دہانیاں و اطلاعات
            </span>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-800 space-y-3 shadow-soft-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isPushEnabled ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400' : 'bg-paper-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400'}`}>
                    {isPushEnabled ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-ink-900 dark:text-white block truncate">
                      Daily Reminders & Duas
                    </span>
                    <span className="arabic-text text-[11px] text-sage-700 dark:text-ink-300 block truncate">
                      روزانہ شام کے معمولات کی یاد دہانی
                    </span>
                  </div>
                </div>

                {/* Toggle switch */}
                {isPushSupported ? (
                  <button
                    type="button"
                    disabled={pushLoading}
                    onClick={handleTogglePush}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                      isPushEnabled ? 'bg-sage-600' : 'bg-paper-300 dark:bg-ink-700'
                    }`}
                    role="switch"
                    aria-checked={isPushEnabled}
                    aria-label="Toggle push notifications"
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isPushEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-paper-200 dark:bg-ink-800 text-ink-500">
                    Not Supported
                  </span>
                )}
              </div>

              <p className="text-[11px] text-ink-600 dark:text-ink-400 leading-snug">
                Fires an evening browser push reminder so you never miss recording your spiritual habits, alongside rotating Duas and verses of the day.
              </p>

              {/* Active Scheduled Badge */}
              {isPushEnabled && (
                <div className="pt-2 border-t border-paper-200 dark:border-ink-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Scheduled daily for 9:00 PM
                  </span>
                  <span className="text-[10px] font-medium text-sage-800 dark:text-sage-300 bg-sage-100 dark:bg-sage-950/80 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 4. Hijri Calendar Adjustment (±3 days for moon sighting) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                Hijri Adjustment · ہجری تاریخ کی ترتیب
              </span>
              {currentAdjustment !== 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage-100 dark:bg-sage-950/60 text-sage-800 dark:text-sage-300">
                  {currentAdjustment > 0 ? `+${currentAdjustment}` : currentAdjustment} {Math.abs(currentAdjustment) === 1 ? 'day' : 'days'}
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-800 space-y-3 shadow-soft-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-sage-100 dark:bg-sage-950/60 text-sage-700 dark:text-sage-300 flex items-center justify-center shrink-0">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-ink-900 dark:text-white block truncate">
                      Moon Sighting Offset (رویتِ ہلال)
                    </span>
                    <span className="text-[11px] font-semibold text-sage-700 dark:text-ink-300 block truncate mt-0.5">
                      {previewHijriUrdu}
                    </span>
                  </div>
                </div>

                {currentAdjustment !== 0 && (
                  <button
                    type="button"
                    onClick={() => onUpdateHijriAdjustment?.(0)}
                    className="text-[10px] font-bold text-amberGold-700 dark:text-amberGold-400 hover:underline px-1.5 py-0.5"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Stepper with - and + buttons */}
              <div className="flex items-center justify-between bg-paper-100 dark:bg-ink-800/80 p-1.5 rounded-xl border border-paper-200 dark:border-ink-700/80">
                <button
                  type="button"
                  disabled={currentAdjustment <= -3}
                  onClick={() => onUpdateHijriAdjustment?.(Math.max(-3, currentAdjustment - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-ink-700 text-ink-700 dark:text-ink-200 disabled:opacity-30 disabled:pointer-events-none hover:bg-paper-200 dark:hover:bg-ink-600 transition-all shadow-sm tap-bounce"
                  aria-label="Decrease Hijri date by 1 day"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <div className="text-center px-2">
                  <span className="text-xs font-bold text-ink-900 dark:text-white block">
                    {currentAdjustment === 0 ? '0 Days (Default)' : `${currentAdjustment > 0 ? `+${currentAdjustment}` : currentAdjustment} ${Math.abs(currentAdjustment) === 1 ? 'Day' : 'Days'}`}
                  </span>
                  <span className="text-[10px] text-ink-500 dark:text-ink-400 block">
                    {currentAdjustment === 0 ? 'Standard Umm al-Qura' : 'Custom Local Adjustment'}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={currentAdjustment >= 3}
                  onClick={() => onUpdateHijriAdjustment?.(Math.min(3, currentAdjustment + 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-ink-700 text-ink-700 dark:text-ink-200 disabled:opacity-30 disabled:pointer-events-none hover:bg-paper-200 dark:hover:bg-ink-600 transition-all shadow-sm tap-bounce"
                  aria-label="Increase Hijri date by 1 day"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Day Chips (-3 to +3) */}
              <div className="grid grid-cols-7 gap-1 pt-0.5">
                {[-3, -2, -1, 0, 1, 2, 3].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onUpdateHijriAdjustment?.(val)}
                    className={`py-1 rounded-lg text-[11px] font-bold transition-all tap-bounce text-center ${
                      currentAdjustment === val
                        ? 'bg-sage-600 text-white shadow-sm'
                        : 'bg-paper-100 hover:bg-paper-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-ink-700 dark:text-ink-300'
                    }`}
                  >
                    {val > 0 ? `+${val}` : val}
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-ink-500 dark:text-ink-400 leading-snug">
                Adjust by ±3 days to match your regional moon sighting
              </p>
            </div>
          </div>

          {/* 5. Spiritual Goal Quick Control */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Spiritual Goal · ہدف یوم
            </span>
            <div className="p-3 rounded-2xl bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-800 space-y-2 shadow-soft-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-amberGold-600" />
                  <div>
                    <span className="text-xs font-bold text-ink-900 dark:text-white block">
                      Target: {goalDay} / {goalMaxDays} Days
                    </span>
                    <span className="text-[11px] text-ink-500 dark:text-ink-400 block">
                      Current chilla / spiritual consistency goal
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenEditGoal();
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-sage-700 dark:text-sage-300 hover:text-white bg-sage-50 dark:bg-sage-950/60 hover:bg-sage-600 dark:hover:bg-sage-600 border border-sage-300 dark:border-sage-800 rounded-xl transition-all tap-bounce"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>

          {/* 5. Data & Utilities */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Data & Sheet Actions · اعمال
            </span>
            <div className="rounded-2xl bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-800 divide-y divide-paper-200 dark:divide-ink-800 shadow-soft-sm overflow-hidden">
              {/* Reset Today's Checks */}
              {onResetToday && (
                <button
                  onClick={handleConfirmResetToday}
                  className="w-full px-3.5 py-3 text-left hover:bg-paper-100 dark:hover:bg-ink-800 flex items-center justify-between transition-colors tap-bounce"
                >
                  <div className="flex items-center gap-2.5">
                    <RotateCcw className="w-4 h-4 text-amberGold-600" />
                    <div>
                      <span className="text-xs font-bold text-ink-900 dark:text-white block">
                        Reset Today's Checks
                      </span>
                      <span className="text-[10px] text-ink-500 dark:text-ink-400">
                        Clear all ticks for today only (آج کے معمولات خالی کریں)
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
                </button>
              )}

              {/* Export Backup */}
              {state && (
                <button
                  onClick={handleExportJSON}
                  className="w-full px-3.5 py-3 text-left hover:bg-paper-100 dark:hover:bg-ink-800 flex items-center justify-between transition-colors tap-bounce"
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="w-4 h-4 text-sage-600 dark:text-sage-400" />
                    <div>
                      <span className="text-xs font-bold text-ink-900 dark:text-white block">
                        Export Backup (JSON)
                      </span>
                      <span className="text-[10px] text-ink-500 dark:text-ink-400">
                        Save all history and custom tasks to a file
                      </span>
                    </div>
                  </div>
                  {exportStatus ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full animate-fadeIn">
                      <Check className="w-3 h-3" />
                      <span>{exportStatus}</span>
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
                  )}
                </button>
              )}

              {/* Restore Backup */}
              {onRestoreBackup && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileSelect}
                    className="hidden"
                    aria-label="Upload backup JSON file"
                  />
                  <button
                    type="button"
                    onClick={handleRestoreClick}
                    className="w-full px-3.5 py-3 text-left hover:bg-paper-100 dark:hover:bg-ink-800 flex items-center justify-between transition-colors tap-bounce"
                  >
                    <div className="flex items-center gap-2.5">
                      <Upload className="w-4 h-4 text-sage-600 dark:text-sage-400" />
                      <div>
                        <span className="text-xs font-bold text-ink-900 dark:text-white block">
                          Restore Backup (JSON)
                        </span>
                        <span className="text-[10px] text-ink-500 dark:text-ink-400">
                          Load history & tasks from a backup file
                        </span>
                      </div>
                    </div>
                    {restoreStatus ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full animate-fadeIn">
                        <Check className="w-3 h-3" />
                        <span>{restoreStatus}</span>
                      </span>
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
                    )}
                  </button>
                </>
              )}

              {/* Reset All to Factory Defaults */}
              {onResetToDefault && (
                <button
                  onClick={handleConfirmResetDefaults}
                  className="w-full px-3.5 py-3 text-left hover:bg-terracotta-50 dark:hover:bg-terracotta-950/30 flex items-center justify-between transition-colors tap-bounce group"
                >
                  <div className="flex items-center gap-2.5">
                    <RefreshCw className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400" />
                    <div>
                      <span className="text-xs font-bold text-terracotta-600 dark:text-terracotta-400 block">
                        Reset Tasks to Factory Defaults
                      </span>
                      <span className="text-[10px] text-ink-500 dark:text-ink-400">
                        Restore original Sunan and categories list
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
                </button>
              )}
            </div>
          </div>

          {/* 6. Privacy Trust Banner */}
          <div className="p-3 rounded-2xl bg-sage-50/70 dark:bg-sage-950/40 border border-sage-200 dark:border-sage-900/60 text-xs text-sage-900 dark:text-sage-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[11px]">
              <ShieldCheck className="w-4 h-4 text-sage-600 dark:text-sage-400 shrink-0" />
              <span>100% Private & Offline-First</span>
            </div>
            <p className="text-[11px] text-sage-800 dark:text-ink-300 leading-relaxed opacity-90">
              No account, no cloud servers, and no tracking. All data is kept securely on this device alone.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 pt-3 border-t border-paper-200 dark:border-ink-800 flex items-center justify-between text-[11px] text-ink-400 dark:text-ink-500">
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateToAdmin?.();
            }}
            className="hover:text-sage-600 dark:hover:text-sage-300 transition-colors text-left tap-bounce"
            title="Admin Notifications Dashboard"
          >
            معمولات · v1.0
          </button>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amberGold-500" />
            <span>Tazkiyah Companion</span>
          </span>
        </div>
      </div>
    </>
  );
};
