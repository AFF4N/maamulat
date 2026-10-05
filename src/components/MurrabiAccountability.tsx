import React, { useState } from 'react';
import type { MaamulatState } from '../types';
import { generateWhatsAppReport, buildWhatsAppLink } from '../utils/reportGenerator';
import {
  Send,
  Copy,
  Check,
  HelpCircle,
  Shield,
  HeartHandshake,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';

interface MurrabiAccountabilityProps {
  state: MaamulatState;
  onUpdateMurrabiContact: (contact: string) => void;
  currentStreak: number;
  isViewingPastDay?: boolean;
  activeDateLabel?: string;
  onSelectYesterday?: () => void;
}

export const MurrabiAccountability: React.FC<MurrabiAccountabilityProps> = ({
  state,
  onUpdateMurrabiContact,
  currentStreak,
  isViewingPastDay,
  activeDateLabel,
  onSelectYesterday,
}) => {
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isContactEditing, setIsContactEditing] = useState(false);
  const [contactInput, setContactInput] = useState(state.murrabiContact || '');
  const [userNote, setUserNote] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Is unlocked? If streak >= 3 or if Murrabi query param was explicitly supplied in URL
  const isUnlocked = currentStreak >= 3 || !!state.murrabiContact;

  const rawReport = generateWhatsAppReport(state);
  const finalReportWithNote = userNote.trim()
    ? `${rawReport}\n\n*نوٹ / Note:*\n${userNote.trim()}`
    : rawReport;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(finalReportWithNote);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handleSendWhatsApp = () => {
    const link = buildWhatsAppLink(state.murrabiContact || contactInput, finalReportWithNote);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMurrabiContact(contactInput);
    setIsContactEditing(false);
  };

  // If locked (early streak < 3 days and no ?murrabi= parameter), show a peaceful teaser
  if (!isUnlocked) {
    return (
      <section className="rounded-2xl p-4 bg-paper-100/70 dark:bg-ink-800/50 border border-dashed border-paper-300 dark:border-ink-700 text-center my-4 space-y-2">
        <div className="w-8 h-8 rounded-full bg-paper-200 dark:bg-ink-700 mx-auto flex items-center justify-center text-ink-500">
          <HeartHandshake className="w-4 h-4" />
        </div>
        <h3 className="arabic-text text-base font-bold text-ink-800 dark:text-ink-200">
          مربی و رفیقِ احتساب (Accountability Partner)
        </h3>
        <p className="text-xs text-ink-600 dark:text-ink-400 max-w-sm mx-auto leading-relaxed">
          Build your personal consistency for <strong>3 days</strong> to unlock the Murrabi accountability report. Consistency begins quietly in the heart first.
        </p>
        <span className="inline-block text-[11px] font-semibold text-amberGold-600 dark:text-amberGold-400">
          Current: {currentStreak} / 3 days streak
        </span>
      </section>
    );
  }

  return (
    <section className="rounded-2xl p-4 bg-gradient-to-br from-white to-sage-50/30 dark:from-ink-800 dark:to-ink-850 border border-sage-200 dark:border-sage-900/60 shadow-soft-md my-4 space-y-3.5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="p-2 rounded-xl bg-sage-100 dark:bg-sage-950/60 text-sage-700 dark:text-sage-300 flex-shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-ink-900 dark:text-white leading-tight">
              Murrabi Report <span className="arabic-text text-sm font-normal opacity-75">(ارسال برائے مربی)</span>
            </h3>
            {isViewingPastDay ? (
              <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300 mt-0.5">
                Selected: {activeDateLabel || state.todayDate} Report · منتخب رپورٹ. Review or edit tasks above, then send to your mentor.
              </p>
            ) : (
              <p className="text-[11px] text-ink-600 dark:text-ink-400 mt-0.5">
                Share your daily sheet with your spiritual mentor or accountability partner. (مربی سے روزانہ شیٹ شیئر کریں)
              </p>
            )}
          </div>
        </div>

        {/* Why Involve Another Person Button */}
        <button
          onClick={() => setShowWhyModal(true)}
          className="text-[11px] font-semibold text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sage-50 dark:bg-sage-900/40 border border-sage-200/80 dark:border-sage-800/80 transition-colors tap-bounce"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Why a Murrabi?</span>
        </button>
      </div>

      {/* Murrabi Contact Row */}
      <div className="p-3 rounded-xl bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-ink-400 tracking-wider">
            Murrabi WhatsApp / Contact
          </span>
          <div className="font-semibold text-ink-800 dark:text-ink-200 flex items-center gap-1.5 mt-0.5">
            {state.murrabiContact ? (
              <span className="font-mono text-sage-700 dark:text-sage-300">
                {state.murrabiContact}
              </span>
            ) : (
              <span className="text-ink-500 italic">No number set (can copy report or add below)</span>
            )}
          </div>
        </div>

        {isContactEditing ? (
          <form onSubmit={handleSaveContact} className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="+923001234567"
              value={contactInput}
              onChange={(e) => setContactInput(e.target.value)}
              className="text-xs px-2 py-1 rounded border border-sage-400 bg-white dark:bg-ink-800 text-ink-900 dark:text-white w-36 font-mono"
              autoFocus
            />
            <button
              type="submit"
              className="px-2 py-1 rounded bg-sage-600 text-white font-medium hover:bg-sage-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsContactEditing(false)}
              className="px-1.5 py-1 text-ink-400 hover:text-ink-600"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => {
              setContactInput(state.murrabiContact || '');
              setIsContactEditing(true);
            }}
            className="text-[11px] font-medium text-sage-700 dark:text-sage-300 hover:underline self-start sm:self-auto"
          >
            {state.murrabiContact ? 'Change Contact' : '+ Set Contact Number'}
          </button>
        )}
      </div>

      {/* Optional Short Reflection Note */}
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-ink-600 dark:text-ink-400 flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          <span>Optional message or reflection to attach:</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Need special du'a for Fajr consistency today..."
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
          className="w-full text-xs px-3 py-2 rounded-xl border border-paper-300 dark:border-ink-700 bg-white dark:bg-ink-850 text-ink-900 dark:text-white placeholder:text-ink-400"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        <button
          onClick={handleSendWhatsApp}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sage-700 hover:bg-sage-800 text-white text-xs font-bold transition-all shadow-sm tap-bounce"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isViewingPastDay ? 'Send Selected Day via WhatsApp' : 'Send via WhatsApp'}</span>
        </button>

        <button
          onClick={handleCopy}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all tap-bounce ${isCopied
            ? 'bg-emerald-600 text-white border-emerald-600'
            : 'bg-white dark:bg-ink-700 text-ink-800 dark:text-white border-paper-300 dark:border-ink-600 hover:border-sage-400'
            }`}
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Formatted Report</span>
            </>
          )}
        </button>
      </div>

      {/* Yesterday's Quick Switch Button (if on today) */}
      {!isViewingPastDay && onSelectYesterday && (
        <button
          onClick={onSelectYesterday}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 text-xs font-semibold tap-bounce transition-all"
        >
          <span>Switch to Yesterday's Report (کل کی رپورٹ دیکھیں و بھیجیں)</span>
          <span>➔</span>
        </button>
      )}

      {/* Toggle Live Report Preview */}
      <div className="pt-1">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full py-1 text-[11px] font-semibold text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-200 flex items-center justify-center gap-1"
        >
          <span>{showPreview ? 'Hide Report Preview' : 'Show Report Preview'}</span>
          {showPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showPreview && (
          <div className="mt-2 p-3 rounded-xl bg-paper-100 dark:bg-ink-900 border border-paper-300 dark:border-ink-700 text-[11px] font-mono leading-relaxed whitespace-pre-wrap select-all text-ink-800 dark:text-ink-200 max-h-64 overflow-y-auto animate-fadeIn">
            {finalReportWithNote}
          </div>
        )}
      </div>

      {/* "Why Involve Another Person?" Explanatory Modal */}
      {showWhyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white dark:bg-ink-800 rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col p-4 sm:p-5 border border-paper-300 dark:border-ink-700 shadow-xl">
            <div className="flex items-center justify-between border-b border-paper-200 dark:border-ink-700 pb-2.5 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-sage-600 flex-shrink-0" />
                <h4 className="text-sm sm:text-base font-bold text-ink-900 dark:text-white">
                  Why Involve an Accountability Partner?
                </h4>
              </div>
              <button
                onClick={() => setShowWhyModal(false)}
                className="text-ink-400 hover:text-ink-700 dark:hover:text-white text-sm p-1"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 py-3 pr-1 space-y-3 text-xs text-ink-700 dark:text-ink-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-sage-50 dark:bg-sage-950/40 border border-sage-200 dark:border-sage-800/80 text-sage-900 dark:text-sage-200">
                <p className="font-semibold text-sm mb-1">
                  Allah is the One we ultimately answer to.
                </p>
                <p className="text-[11px]">
                  An accountability partner or Murrabi never replaces sincerity (Ikhlas) or Allah's role. Intention is solely for Allah.
                </p>
              </div>

              <p>
                <strong>The purpose of a Murrabi / Partner:</strong>
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-[11px]">
                <li>
                  <strong>Human Encouragement:</strong> Reminding us when motivation wavers and the nafs whispers excuses.
                </li>
                <li>
                  <strong>Consistency (*Istiqaamah*):</strong> The Prophet ﷺ taught us that mutual advice and companionship keep the heart firm upon righteousness.
                </li>
                <li>
                  <strong>Gentle Oversight:</strong> Knowing someone who cares about your spiritual welfare is checking in prevents heedlessness (*ghaflah*).
                </li>
              </ul>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-950 dark:text-amber-200 space-y-1">
                <p className="font-bold text-xs">
                  ⚠️ And do not let Shaytan trick you into thinking all this...
                </p>
                <p className="text-[11px] leading-relaxed">
                  Do not let Shaytan whisper that tracking deeds or sharing your sheet with a mentor is showing off (<em>Riya</em>) or unnecessary pride. Shaytan loves isolation because the wolf preys on the solitary sheep. Seeking guidance and mutual accountability is the practice of spiritual seekers to build steadfastness (<em>Istiqaamah</em>).
                </p>
              </div>

              <p className="text-[11px] text-ink-500 italic">
                You can share this report whenever you feel ready. There is zero pressure; your relationship with your Creator remains pure and primary.
              </p>
            </div>

            <div className="pt-2 flex-shrink-0">
              <button
                onClick={() => setShowWhyModal(false)}
                className="w-full py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-semibold transition-colors"
              >
                Understood (جزاک اللہ خیراً)
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
