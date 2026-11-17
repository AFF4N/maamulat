import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  WifiOff,
  BellRing,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useModalTransition } from '../hooks/useModalTransition';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Capture beforeinstallprompt globally if fired before modal mounts
let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e as BeforeInstallPromptEvent;
  });
}

interface PwaInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPushSupported?: boolean;
}

export const PwaInstallGuideModal: React.FC<PwaInstallGuideModalProps> = ({
  isOpen,
  onClose,
  isPushSupported = true,
}) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>(() => {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent || '';
      if (/iPad|iPhone|iPod/i.test(ua)) return 'ios';
    }
    return 'android';
  });

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => deferredInstallPrompt
  );
  const [isStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredInstallPrompt = e as BeforeInstallPromptEvent;
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const { shouldRender, isClosing } = useModalTransition(isOpen);

  if (!shouldRender) return null;

  const handleNativeInstall = async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        deferredInstallPrompt = null;
        setInstallPrompt(null);
      }
    } catch (err) {
      console.error('Install prompt error:', err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="App Installation & Offline Notifications Guide"
      className={`fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 overscroll-none ${isClosing ? 'animate-backdrop-out pointer-events-none' : 'animate-backdrop'}`}
    >
      <div className={`bg-white dark:bg-ink-800 rounded-2xl max-w-md w-full h-[85dvh] max-h-[680px] flex flex-col p-4 sm:p-5 border border-paper-300 dark:border-ink-700 shadow-xl ${isClosing ? 'animate-modal-out' : 'animate-modal-in'}`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-paper-200 dark:border-ink-700 pb-2.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-sage-100 dark:bg-sage-950/60 text-sage-700 dark:text-sage-300 flex-shrink-0">
              <Smartphone className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-ink-900 dark:text-white leading-tight">
                Install App · Offline &amp; Notifications
              </h4>
              <p className="arabic-text text-[11px] text-sage-700 dark:text-sage-400">
                ایپ انسٹال کرنے اور یاد دہانی فعال کرنے کا طریقہ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-400 hover:text-ink-700 dark:hover:text-white text-sm p-1"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          style={{ WebkitOverflowScrolling: 'touch' }}
          className="overflow-y-auto overscroll-contain will-change-scroll flex-1 py-3 pr-1 space-y-3.5 text-xs text-ink-700 dark:text-ink-300 leading-relaxed"
        >
          {/* Why Not Supported / Benefits Callout */}
          {!isPushSupported ? (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-950 dark:text-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <BellRing className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Why does it say &ldquo;Not Supported&rdquo;?</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                On <strong>iPhone / iPad (iOS)</strong>—or inside in-app browsers like WhatsApp—notifications are disabled inside regular browser tabs. <strong>Once you add Maamulat to your Home Screen</strong> using the 2 steps below and open it from there, push notifications and full offline mode will work!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-sage-50 dark:bg-sage-950/40 border border-sage-200 dark:border-sage-800/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-sage-900 dark:text-sage-200 text-[11px]">
                  <WifiOff className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400 shrink-0" />
                  <span>Works 100% Offline</span>
                </div>
                <p className="text-[10px] text-sage-800 dark:text-ink-300 leading-snug">
                  Open and record your daily Maamulat anytime even without internet.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-amberGold-50/80 dark:bg-amberGold-950/30 border border-amberGold-200 dark:border-amberGold-800/70 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-ink-900 dark:text-amberGold-200 text-[11px]">
                  <BellRing className="w-3.5 h-3.5 text-amberGold-600 dark:text-amberGold-400 shrink-0" />
                  <span>Daily Reminders</span>
                </div>
                <p className="text-[10px] text-ink-700 dark:text-ink-300 leading-snug">
                  Receive reliable 9:00 PM evening reminders &amp; rotating Duas on your phone.
                </p>
              </div>
            </div>
          )}

          {/* Direct 1-Tap Install Banner if supported by Android/Desktop Chrome */}
          {installPrompt && !isStandalone && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 block">
                  Ready for 1-Tap Install
                </span>
                <span className="text-[10px] text-emerald-800 dark:text-emerald-300 block">
                  Install directly without opening browser menus:
                </span>
              </div>
              <button
                type="button"
                onClick={handleNativeInstall}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm tap-bounce"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install Now</span>
              </button>
            </div>
          )}

          {/* Platform Tabs: iPhone (iOS) vs Android */}
          <div className="flex items-center bg-paper-100 dark:bg-ink-900 p-1 rounded-xl border border-paper-200 dark:border-ink-700">
            <button
              type="button"
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'ios'
                ? 'bg-white dark:bg-ink-750 text-ink-900 dark:text-white shadow-sm'
                : 'text-ink-500 hover:text-ink-800 dark:hover:text-ink-200'
                }`}
            >
              <span>iPhone (Safari)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'android'
                ? 'bg-white dark:bg-ink-750 text-ink-900 dark:text-white shadow-sm'
                : 'text-ink-500 hover:text-ink-800 dark:hover:text-ink-200'
                }`}
            >
              <span>Android (Chrome)</span>
            </button>
          </div>

          {activeTab === 'ios' ? (
            <div className="space-y-3 animate-fadeIn">
              {/* In-App Browser Tip */}
              <div className="px-3 py-2 rounded-xl bg-paper-100 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 flex items-center gap-2 text-[11px] text-ink-600 dark:text-ink-300">
                <ExternalLink className="w-3.5 h-3.5 text-sage-600 shrink-0" />
                <span>
                  Open this page in <strong>Safari</strong> (if opened inside WhatsApp, tap the compass icon in the bottom-right first).
                </span>
              </div>

              {/* Step 1 Card with Screenshot Image */}
              <div className="p-3 rounded-2xl bg-paper-50 dark:bg-ink-850 border border-paper-200 dark:border-ink-700 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sage-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span className="font-bold text-ink-900 dark:text-white">
                    Tap the Share icon at the bottom of Safari
                  </span>
                </div>
                <img
                  src="/pwa-guide/ios-step-1.svg"
                  alt="iOS Safari Step 1: Tap the Share icon at the bottom toolbar"
                  className="w-full rounded-xl border border-paper-300/80 dark:border-ink-700 shadow-soft-sm"
                  decoding="async"
                />
              </div>

              {/* Step 2 Card with Screenshot Image */}
              <div className="p-3 rounded-2xl bg-paper-50 dark:bg-ink-850 border border-paper-200 dark:border-ink-700 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sage-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span className="font-bold text-ink-900 dark:text-white">
                    Scroll down &amp; tap &ldquo;Add to Home Screen&rdquo;
                  </span>
                </div>
                <img
                  src="/pwa-guide/ios-step-2.svg"
                  alt="iOS Safari Step 2: Tap Add to Home Screen in the Share menu"
                  className="w-full rounded-xl border border-paper-300/80 dark:border-ink-700 shadow-soft-sm"
                  decoding="async"
                />
              </div>

              {/* Step 3 Summary */}
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-[11px] text-emerald-950 dark:text-emerald-200 leading-snug">
                  <strong>Step 3:</strong> Tap <strong>Add</strong> in the top-right corner, launch <strong>معمولات</strong> from your Home Screen, and toggle on <strong>Daily Reminders</strong> in the Menu!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-fadeIn">
              {/* Step 1 Card with Screenshot Image */}
              <div className="p-3 rounded-2xl bg-paper-50 dark:bg-ink-850 border border-paper-200 dark:border-ink-700 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sage-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span className="font-bold text-ink-900 dark:text-white">
                    Tap the 3-dot menu (⋮) in top-right of Chrome
                  </span>
                </div>
                <img
                  src="/pwa-guide/android-step-1.svg"
                  alt="Android Chrome Step 1: Tap the three-dot menu icon in the top-right corner"
                  className="w-full rounded-xl border border-paper-300/80 dark:border-ink-700 shadow-soft-sm"
                  decoding="async"
                />
              </div>

              {/* Step 2 Card with Screenshot Image */}
              <div className="p-3 rounded-2xl bg-paper-50 dark:bg-ink-850 border border-paper-200 dark:border-ink-700 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sage-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span className="font-bold text-ink-900 dark:text-white">
                    Tap &ldquo;Install app&rdquo; (or &ldquo;Add to Home screen&rdquo;)
                  </span>
                </div>
                <img
                  src="/pwa-guide/android-step-2.svg"
                  alt="Android Chrome Step 2: Tap Install app or Add to Home screen from the menu"
                  className="w-full rounded-xl border border-paper-300/80 dark:border-ink-700 shadow-soft-sm"
                  decoding="async"
                />
              </div>

              {/* Step 3 Summary */}
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-[11px] text-emerald-950 dark:text-emerald-200 leading-snug">
                  <strong>Step 3:</strong> Confirm by tapping <strong>Install</strong>, open <strong>معمولات</strong> from your Home Screen, and enable <strong>Daily Reminders</strong> in the Menu!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-semibold transition-colors tap-bounce"
          >
            Got It (جزاک اللہ خیراً)
          </button>
        </div>
      </div>
    </div>
  );
};
