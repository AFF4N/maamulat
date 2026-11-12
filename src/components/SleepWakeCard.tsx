import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Clock, Minus, Plus } from 'lucide-react';
import { format12HourTime, shiftTimeByMinutes } from '../utils/dateUtils';

interface SleepWakeCardProps {
  sleepTime: string;
  wakeTime: string;
  onSleepTimeChange: (time: string) => void;
  onWakeTimeChange: (time: string) => void;
}

// Sleep times from 9:00 PM to 12:00 AM
const SLEEP_PRESETS = [
  '09:00 PM',
  '09:30 PM',
  '10:00 PM',
  '10:30 PM',
  '11:00 PM',
  '11:30 PM',
  '12:00 AM',
];

// Wake times from Tahajjud till Chasht (3:00 AM to 8:00 AM) across Pakistan seasons
const WAKE_PRESETS = [
  '03:00 AM',
  '03:30 AM',
  '04:00 AM',
  '04:30 AM',
  '05:00 AM',
  '05:30 AM',
  '06:00 AM',
  '06:30 AM',
  '07:00 AM',
  '07:30 AM',
  '08:00 AM',
];

const HOURS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const MINUTES = ['00', '15', '30', '45'];
const PERIODS: ('AM' | 'PM')[] = ['AM', 'PM'];

function split12HourParts(formattedTime: string): { hour: string; minute: string; period: 'AM' | 'PM' } {
  const match = formattedTime.match(/^(\d{2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return { hour: '11', minute: '30', period: 'PM' };
  }
  return {
    hour: match[1],
    minute: match[2],
    period: match[3].toUpperCase() as 'AM' | 'PM',
  };
}

interface TimePresetBoxProps {
  icon: React.ReactNode;
  urduLabel: string;
  englishLabel: string;
  time: string;
  presets: string[];
  colorTheme: 'indigo' | 'amber';
  onTimeChange: (time: string) => void;
  fallbackTime: string;
}

const TimePresetBox: React.FC<TimePresetBoxProps> = ({
  icon,
  urduLabel,
  englishLabel,
  time,
  presets,
  colorTheme,
  onTimeChange,
  fallbackTime,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isIndigo = colorTheme === 'indigo';
  const badgeClasses = isIndigo
    ? 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60'
    : 'text-stone-700 dark:text-stone-300 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/60';
  const activePresetClasses = isIndigo
    ? 'bg-slate-100 text-slate-800 border-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-500 font-bold shadow-soft-sm'
    : 'bg-amber-50/80 text-stone-800 border-amber-300/80 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-700/60 font-bold shadow-soft-sm';
  const hoverBorderClasses = isIndigo
    ? 'hover:border-slate-400 dark:hover:border-slate-500'
    : 'hover:border-amber-300 dark:hover:border-amber-700';

  const displayTime = format12HourTime(time, fallbackTime);
  const { hour, minute, period } = split12HourParts(displayTime);

  const handleStepMinutes = (delta: number) => {
    const updated = shiftTimeByMinutes(time, delta, fallbackTime);
    onTimeChange(updated);
  };

  const handleSelectPart = (newHour: string, newMinute: string, newPeriod: 'AM' | 'PM') => {
    onTimeChange(`${newHour}:${newMinute} ${newPeriod}`);
  };

  // Close menu on outside click or Escape
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <div className="p-3 rounded-xl bg-paper-50 dark:bg-ink-850 border border-paper-200 dark:border-ink-700 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-700 dark:text-ink-300">
            {icon}
            <span>{englishLabel}</span>
            <span className="arabic-text text-sm font-bold">{urduLabel}</span>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${badgeClasses}`} dir="ltr">
            {displayTime}
          </span>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-1">
          {presets.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTimeChange(t)}
              className={`text-[10px] px-2 py-1 rounded-md border transition-all tap-bounce ${
                displayTime === t
                  ? activePresetClasses
                  : `bg-white dark:bg-ink-750 text-ink-600 dark:text-ink-300 border-paper-300 dark:border-ink-650 ${hoverBorderClasses}`
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Minimal Unified Time Field + Stepper Bar (No green focus ring, custom minimal menu) */}
      <div ref={containerRef} className="relative mt-2.5 pt-2 border-t border-paper-200 dark:border-ink-700/60">
        <div className="flex items-stretch rounded-xl border border-paper-300 dark:border-ink-650 bg-white dark:bg-ink-750 overflow-hidden transition-colors">
          {/* Spaced Time Trigger Button (matches "01 : 00 AM" reference) */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-label={`${englishLabel} time selector`}
            className="flex-1 min-w-0 px-3.5 py-2 text-left text-xs font-semibold tracking-wide text-ink-900 dark:text-white bg-transparent hover:bg-paper-50/80 dark:hover:bg-ink-700/40 focus:outline-none transition-colors flex items-center gap-1.5"
            dir="ltr"
          >
            <span className="tabular-nums">
              {hour} : {minute}
            </span>
            <span className="text-[11px] font-semibold text-ink-500 dark:text-ink-300 ml-0.5">
              {period}
            </span>
          </button>

          {/* Flush − and + Stepper Buttons (±15m) */}
          <div className="flex items-stretch border-l border-paper-200 dark:border-ink-650 divide-x divide-paper-200 dark:divide-ink-650 shrink-0">
            <button
              type="button"
              onClick={() => handleStepMinutes(-15)}
              className="w-9 flex items-center justify-center text-ink-500 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-700 hover:text-ink-900 dark:hover:text-white focus:outline-none transition-colors tap-bounce"
              title="Subtract 15 minutes"
              aria-label={`Decrease ${englishLabel} time by 15 minutes`}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleStepMinutes(15)}
              className="w-9 flex items-center justify-center text-ink-500 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-700 hover:text-ink-900 dark:hover:text-white focus:outline-none transition-colors tap-bounce"
              title="Add 15 minutes"
              aria-label={`Increase ${englishLabel} time by 15 minutes`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Minimal Theme-Matched Time Popover Menu */}
        {isMenuOpen && (
          <div
            role="dialog"
            aria-label={`${englishLabel} time picker menu`}
            dir="ltr"
            className="absolute left-0 right-0 bottom-[calc(100%-0.25rem)] z-30 p-2.5 rounded-xl bg-white dark:bg-ink-800 border border-paper-300 dark:border-ink-650 shadow-xl animate-fadeIn space-y-2"
          >
            {/* Hours Grid (01 - 12) */}
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-ink-400 dark:text-ink-500 block mb-1 px-0.5">
                Hour
              </span>
              <div className="grid grid-cols-6 gap-1">
                {HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleSelectPart(h, minute, period)}
                    className={`py-1 rounded-lg text-[11px] font-semibold tabular-nums transition-colors focus:outline-none ${
                      hour === h
                        ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900 font-bold'
                        : 'bg-paper-50 dark:bg-ink-750 text-ink-700 dark:text-ink-300 hover:bg-paper-200 dark:hover:bg-ink-700'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes (00, 15, 30, 45) & AM/PM Row */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-paper-200 dark:border-ink-700">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-ink-400 dark:text-ink-500 block mb-1 px-0.5">
                  Minute
                </span>
                <div className="grid grid-cols-4 gap-1">
                  {MINUTES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelectPart(hour, m, period)}
                      className={`py-1 rounded-lg text-[11px] font-semibold tabular-nums transition-colors focus:outline-none ${
                        minute === m
                          ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900 font-bold'
                          : 'bg-paper-50 dark:bg-ink-750 text-ink-700 dark:text-ink-300 hover:bg-paper-200 dark:hover:bg-ink-700'
                      }`}
                    >
                      :{m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-ink-400 dark:text-ink-500 block mb-1 px-0.5">
                  Period
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {PERIODS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        handleSelectPart(hour, minute, p);
                        setIsMenuOpen(false);
                      }}
                      className={`py-1 rounded-lg text-[11px] font-semibold transition-colors focus:outline-none ${
                        period === p
                          ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900 font-bold'
                          : 'bg-paper-50 dark:bg-ink-750 text-ink-700 dark:text-ink-300 hover:bg-paper-200 dark:hover:bg-ink-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const SleepWakeCard: React.FC<SleepWakeCardProps> = ({
  sleepTime,
  wakeTime,
  onSleepTimeChange,
  onWakeTimeChange,
}) => {
  return (
    <section className="rounded-2xl p-3.5 sm:p-4 bg-white dark:bg-ink-800 border border-paper-300 dark:border-ink-700/80 shadow-soft-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-paper-200/80 dark:border-ink-700/60 pb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-lg flex-shrink-0 select-none">🟤</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-row-reverse items-baseline justify-between gap-2">
              <h2 className="arabic-text text-lg sm:text-xl font-bold text-ink-900 dark:text-white leading-tight">
                سونے اور جاگنے کا وقت
              </h2>
              <span className="text-xs text-ink-500 dark:text-ink-400 font-medium">
                Sleep & Wake Schedule
              </span>
            </div>
          </div>
        </div>
        <Clock className="w-4 h-4 text-ink-400 flex-shrink-0" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Sleep Time Box */}
        <TimePresetBox
          icon={<Moon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />}
          urduLabel="سونے کا وقت"
          englishLabel="Sleep:"
          time={sleepTime}
          presets={SLEEP_PRESETS}
          colorTheme="indigo"
          onTimeChange={onSleepTimeChange}
          fallbackTime="11:30 PM"
        />

        {/* Wake Time Box */}
        <TimePresetBox
          icon={<Sun className="w-3.5 h-3.5 text-amber-600/70 dark:text-amber-400/80" />}
          urduLabel="جاگنے کا وقت"
          englishLabel="Wake:"
          time={wakeTime}
          presets={WAKE_PRESETS}
          colorTheme="amber"
          onTimeChange={onWakeTimeChange}
          fallbackTime="05:00 AM"
        />
      </div>
    </section>
  );
};
