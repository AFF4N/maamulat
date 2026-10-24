import React, { useState } from 'react';
import { Shield, KeyRound, ArrowLeft, AlertCircle, RotateCw, Lock } from 'lucide-react';

interface AdminAuthScreenProps {
  onBack: () => void;
  onLogin: (pin: string, remember: boolean) => Promise<boolean>;
  loading: boolean;
  authError: string | null;
}

export const AdminAuthScreen: React.FC<AdminAuthScreenProps> = ({
  onBack,
  onLogin,
  loading,
  authError
}) => {
  const [pinInput, setPinInput] = useState('');
  const [rememberPin, setRememberPin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    onLogin(pinInput.trim(), rememberPin);
  };

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950 text-ink-900 dark:text-ink-100 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-sm bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 dark:text-ink-400 hover:text-sage-700 dark:hover:text-sage-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to App
          </button>
          <span className="text-[11px] font-bold text-sage-800 dark:text-sage-300 bg-sage-100 dark:bg-sage-950/60 px-2.5 py-0.5 rounded-full border border-sage-200 dark:border-sage-800">
            Admin Portal
          </span>
        </div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-sage-100 dark:bg-sage-950/60 text-sage-700 dark:text-sage-300 flex items-center justify-center shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-ink-900 dark:text-white">
            Admin Authentication
          </h1>
          <p className="arabic-text text-sm text-sage-700 dark:text-ink-300">
            مرکزِ انتظامی معمولات
          </p>
          <p className="text-xs text-ink-500 dark:text-ink-400">
            Enter your secure PIN to access the administrative dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1.5">
              Admin Passcode / PIN
            </label>
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                placeholder="Enter your PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full text-center text-xl tracking-widest font-mono py-2.5 px-4 rounded-xl border border-paper-300 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500"
                autoFocus
              />
              <KeyRound className="w-4 h-4 text-ink-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-ink-600 dark:text-ink-400 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberPin}
              onChange={(e) => setRememberPin(e.target.checked)}
              className="rounded border-paper-300 text-sage-600 focus:ring-sage-500"
            />
            <span>Remember PIN on this browser</span>
          </label>

          {authError && (
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 text-xs text-red-700 dark:text-red-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !pinInput.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-sm transition-colors tap-bounce shadow-soft-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" /> Unlock Dashboard
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-paper-200 dark:border-ink-800 text-center">
          <span className="text-[11px] text-ink-400">
            Protected administrative console. Authorized access only.
          </span>
        </div>
      </div>
    </div>
  );
};
