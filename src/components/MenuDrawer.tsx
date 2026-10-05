import React, { useEffect } from 'react';
import {
  X,
  SlidersHorizontal,
  Sun,
  Moon,
  Target,
  RotateCcw,
  Download,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import type { MaamulatState } from '../types';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCustomize: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  goalDay: number;
  goalMaxDays: number;
  onOpenEditGoal: () => void;
  state?: MaamulatState;
  onResetToday?: () => void;
  onResetToDefault?: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToCustomize,
  isDark,
  onToggleTheme,
  goalDay,
  goalMaxDays,
  onOpenEditGoal,
  state,
  onResetToday,
  onResetToDefault,
}) => {
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

  const handleExportJSON = () => {
    if (!state) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `maamulat-backup-${state.todayDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
              <p className="arabic-text text-xs text-sage-700 dark:text-sage-400 text-left">
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
          {/* 1. Customise Tasks Card (Primary CTA) */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sage-700 dark:text-sage-400">
              Customization · تخصیص
            </span>
            <button
              onClick={() => {
                onClose();
                onNavigateToCustomize();
              }}
              className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-br from-white to-sage-50/50 dark:from-ink-850 dark:to-ink-800 border-2 border-sage-300/80 dark:border-sage-700/60 hover:border-sage-500 dark:hover:border-sage-500 shadow-soft-sm hover:shadow-soft-md transition-all tap-bounce group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sage-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-ink-900 dark:text-white">
                        Customize Maamulat
                      </span>
                      <span className="px-1.5 py-0.2 rounded-md bg-sage-100 dark:bg-sage-950 text-[10px] font-semibold text-sage-800 dark:text-sage-300">
                        New
                      </span>
                    </div>
                    <p className="arabic-text text-xs text-ink-700 dark:text-ink-300 font-semibold mt-0.5">
                      معمولات و اسباق کی تخصیص
                    </p>
                    <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-1 leading-snug">
                      Add, edit, reorder or hide daily tasks, prayers, and Hasanat rewards.
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-sage-600 dark:text-sage-400 mt-1 group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            </button>
          </div>

          {/* 2. Theme / Appearance Mode Switcher */}
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

          {/* 3. Spiritual Goal Quick Control */}
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
                  Edit Goal
                </button>
              </div>
            </div>
          </div>

          {/* 4. Data & Utilities */}
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
                  <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
                </button>
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

          {/* 5. Privacy Trust Banner */}
          <div className="p-3 rounded-2xl bg-sage-50/70 dark:bg-sage-950/40 border border-sage-200 dark:border-sage-900/60 text-xs text-sage-900 dark:text-sage-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[11px]">
              <ShieldCheck className="w-4 h-4 text-sage-600 dark:text-sage-400 shrink-0" />
              <span>100% Private & Offline-First</span>
            </div>
            <p className="text-[11px] text-sage-800 dark:text-sage-400 leading-relaxed opacity-90">
              No account, no cloud servers, and no tracking. All data is kept securely on this device alone.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 pt-3 border-t border-paper-200 dark:border-ink-800 flex items-center justify-between text-[11px] text-ink-400 dark:text-ink-500">
          <span>معمولات · v1.0</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amberGold-500" />
            <span>Tazkiyah Companion</span>
          </span>
        </div>
      </div>
    </>
  );
};
