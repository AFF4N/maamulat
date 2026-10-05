import React from 'react';
import { Moon, Sun, Clock } from 'lucide-react';

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

interface TimePresetBoxProps {
  icon: React.ReactNode;
  urduLabel: string;
  englishLabel: string;
  time: string;
  presets: string[];
  colorTheme: 'indigo' | 'amber';
  onTimeChange: (time: string) => void;
  placeholder: string;
}

const TimePresetBox: React.FC<TimePresetBoxProps> = ({
  icon,
  urduLabel,
  englishLabel,
  time,
  presets,
  colorTheme,
  onTimeChange,
  placeholder,
}) => {
  const isIndigo = colorTheme === 'indigo';
  const badgeClasses = isIndigo
    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
    : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60';
  const activePresetClasses = isIndigo
    ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
    : 'bg-amber-600 text-white border-amber-600 font-semibold';
  const hoverBorderClasses = isIndigo ? 'hover:border-indigo-400' : 'hover:border-amber-400';

  return (
    <div className="p-3 rounded-xl bg-paper-50 dark:bg-ink-850 border border-paper-200 dark:border-ink-700 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-700 dark:text-ink-300">
            {icon}
            <span className="arabic-text text-sm font-bold">{urduLabel}</span>
            <span>{englishLabel}</span>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${badgeClasses}`}>
            {time}
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
                time === t
                  ? activePresetClasses
                  : `bg-white dark:bg-ink-750 text-ink-600 dark:text-ink-300 border-paper-300 dark:border-ink-650 ${hoverBorderClasses}`
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-paper-200 dark:border-ink-700/60">
        <input
          type="text"
          placeholder={placeholder}
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-paper-300 dark:border-ink-650 bg-white dark:bg-ink-750 text-ink-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sage-500"
        />
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
          icon={<Moon className="w-3.5 h-3.5 text-indigo-500" />}
          urduLabel="سونے کا وقت:"
          englishLabel="Sleep"
          time={sleepTime}
          presets={SLEEP_PRESETS}
          colorTheme="indigo"
          onTimeChange={onSleepTimeChange}
          placeholder="Or custom e.g. 10:45 PM"
        />

        {/* Wake Time Box */}
        <TimePresetBox
          icon={<Sun className="w-3.5 h-3.5 text-amber-500" />}
          urduLabel="جاگنے کا وقت:"
          englishLabel="Wake"
          time={wakeTime}
          presets={WAKE_PRESETS}
          colorTheme="amber"
          onTimeChange={onWakeTimeChange}
          placeholder="Or custom e.g. 04:15 AM"
        />
      </div>
    </section>
  );
};
