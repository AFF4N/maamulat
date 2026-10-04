import React, { useState } from 'react';
import { Lock, RotateCcw, FastForward, Download, Trash2 } from 'lucide-react';
import type { MaamulatState } from '../types';

interface PrivacyFooterProps {
  state?: MaamulatState;
  onSimulateNextDay?: () => void;
  onResetToday?: () => void;
}

export const PrivacyFooter: React.FC<PrivacyFooterProps> = ({
  state,
  onSimulateNextDay,
  onResetToday,
}) => {
  // --- Local Tools State & Handlers (Kept commented as requested) ---
  const [showTools, setShowTools] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  const handleExportJSON = () => {
    if (!state) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `maamulat-backup-${state.todayDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setCopiedStatus('Backup downloaded!');
    setTimeout(() => setCopiedStatus(null), 2000);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to reset all Maamulat records? This cannot be undone.')) {
      localStorage.removeItem('maamulat_state_v2');
      window.location.reload();
    }
  };

  // Silence unused warnings while commented out
  void showTools;
  void setShowTools;
  void copiedStatus;
  void handleExportJSON;
  void handleClearAll;
  void onSimulateNextDay;
  void onResetToday;

  return (
    <footer className="mt-8 pt-6 pb-12 border-t border-paper-300 dark:border-ink-800 text-center space-y-4">
      {/* Sincere Privacy & Intention Statement */}
      <div className="max-w-md mx-auto space-y-1.5 px-4">
        <div className="flex items-center justify-center gap-1.5 text-sage-700 dark:text-sage-400 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5" />
          <span>This is between you and Allah</span>
        </div>

        <p className="arabic-text text-sm text-ink-800 dark:text-ink-200 font-medium">
          یہ معمولات صرف آپ کے اور اللہ کے درمیان ہیں۔
        </p>

        <p className="text-xs text-ink-500 dark:text-ink-400 leading-relaxed">
          Your Maamulat stay here on your device. No account. No backend. No cloud servers. No one else sees them. Just you and Allah.
        </p>
      </div>

      {/* Discrete Local Testing & Backup Drawer */}
      {/* <div className="pt-2">
        <button
          onClick={() => setShowTools(!showTools)}
          className="text-[11px] text-ink-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-300 underline underline-offset-2 transition-colors"
        >
          {showTools ? 'Hide Local Tools' : 'Local Data & Simulation Tools'}
        </button>

        {showTools && (
          <div className="mt-3 p-3.5 rounded-2xl bg-paper-100 dark:bg-ink-800 border border-paper-300 dark:border-ink-700 max-w-sm mx-auto text-xs space-y-3 animate-fadeIn">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400 block">
              Developer & Offline Tools
            </span>

            <div className="flex flex-col gap-2">
              <button
                onClick={onSimulateNextDay}
                className="w-full py-2 px-3 rounded-lg bg-white dark:bg-ink-700 border border-paper-300 dark:border-ink-600 text-ink-700 dark:text-ink-200 hover:border-sage-500 flex items-center justify-center gap-2 tap-bounce"
              >
                <FastForward className="w-3.5 h-3.5 text-sage-600" />
                <span>Simulate Next Calendar Day (Test Rollover)</span>
              </button>

              <button
                onClick={onResetToday}
                className="w-full py-2 px-3 rounded-lg bg-white dark:bg-ink-700 border border-paper-300 dark:border-ink-600 text-ink-700 dark:text-ink-200 hover:border-amberGold-500 flex items-center justify-center gap-2 tap-bounce"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amberGold-600" />
                <span>Reset Today's Checks</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="w-full py-2 px-3 rounded-lg bg-white dark:bg-ink-700 border border-paper-300 dark:border-ink-600 text-ink-700 dark:text-ink-200 hover:border-sage-500 flex items-center justify-center gap-2 tap-bounce"
              >
                <Download className="w-3.5 h-3.5 text-ink-500" />
                <span>Export Local Backup (JSON)</span>
              </button>

              <button
                onClick={handleClearAll}
                className="w-full py-1.5 px-3 rounded-lg text-terracotta-600 dark:text-terracotta-400 hover:bg-terracotta-50 dark:hover:bg-terracotta-950/40 text-[11px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All Saved Local Data</span>
              </button>
            </div>

            {copiedStatus && (
              <p className="text-[11px] font-semibold text-sage-600 animate-fadeIn">
                {copiedStatus}
              </p>
            )}
          </div>
        )}
      </div> */}

      {/* Developer Credit & Du'a Request */}
      <div className="pt-3 pb-1 space-y-1">
        <p className="text-xs text-ink-700 dark:text-ink-300">
          Made with <span className="text-red-500">❤️</span> by{' '}
          <a
            href="https://github.com/aff4n"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-white underline underline-offset-2 transition-colors"
          >
            Affan Ahmed
          </a>
        </p>
        <p className="text-[11px] text-ink-500 dark:text-ink-400">
          <span className="arabic-text font-medium text-xs">براہِ کرم اپنی دعاؤں میں یاد رکھیں۔</span>
        </p>
      </div>

      <div className="text-[10px] text-ink-400 dark:text-ink-600 pt-2 font-mono">
        معمولات · v1.0 · Offline-First PWA
      </div>
    </footer>
  );
};
