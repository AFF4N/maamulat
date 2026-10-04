import React, { useState } from 'react';
import { Sun, Moon, Sparkles, SlidersHorizontal, Check, Target } from 'lucide-react';
import { formatUrduDate, formatEnglishDate, getUrduDayName } from '../utils/dateUtils';

interface HeaderProps {
  todayDate: string;
  goalDay: number;
  goalMaxDays: number;
  onUpdateGoalDay: (day: number) => void;
  onUpdateGoalMaxDays: (maxDays: number) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const PRESET_GOALS = [7, 21, 40, 100];

export const Header: React.FC<HeaderProps> = ({
  todayDate,
  goalDay,
  goalMaxDays,
  onUpdateGoalDay,
  onUpdateGoalMaxDays,
  isDark,
  onToggleTheme,
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [dayInput, setDayInput] = useState(goalDay.toString());
  const [targetInput, setTargetInput] = useState(goalMaxDays.toString());

  const handleOpenEdit = () => {
    setDayInput(goalDay.toString());
    setTargetInput(goalMaxDays.toString());
    setIsEditingGoal(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseInt(targetInput, 10);
    const parsedDay = parseInt(dayInput, 10);

    if (!isNaN(parsedTarget) && parsedTarget >= 1) {
      onUpdateGoalMaxDays(parsedTarget);
      if (!isNaN(parsedDay) && parsedDay >= 1) {
        onUpdateGoalDay(Math.min(parsedTarget, parsedDay));
      }
      setIsEditingGoal(false);
    }
  };

  const urduDate = formatUrduDate(todayDate);
  const urduDay = getUrduDayName(todayDate);
  const englishDate = formatEnglishDate(todayDate);
  const progressPercent = Math.min(100, Math.round((goalDay / goalMaxDays) * 100));

  return (
    <header className="relative pt-3 pb-4">
      {/* Top action row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-sage-100 dark:bg-sage-950/60 text-sage-700 dark:text-sage-300 text-sm font-semibold border border-sage-200/80 dark:border-sage-800">
            🌿
          </span>
          <span className="text-xs uppercase tracking-widest font-semibold text-sage-700 dark:text-sage-300">
            Tazkiyah & Maamulat
          </span>
        </div>

        <button
          onClick={onToggleTheme}
          aria-label="Toggle dark mode"
          className="p-2 rounded-full border border-paper-300 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white transition-all tap-bounce"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-ink-700" />}
        </button>
      </div>

      {/* Main Title & Bilingual Heading */}
      <div className="text-center space-y-1 mb-4">
        <h1 className="arabic-text text-3xl sm:text-4xl font-bold text-ink-900 dark:text-white tracking-wide">
          معمولاتِ یومیہ
        </h1>
        <p className="serif-display text-sm tracking-widest uppercase text-ink-500 dark:text-ink-400">
          Daily Spiritual Ritual Sheet
        </p>
        <p className="text-xs text-ink-600 dark:text-ink-400 font-medium pt-0.5">
          <span className="arabic-text font-semibold">{urduDay}، {urduDate}</span>
          <span className="mx-1.5 opacity-40">·</span>
          <span>{englishDate}</span>
        </p>
      </div>

      {/* Customizable Spiritual Goal Tracker Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-white to-paper-100 dark:from-ink-850 dark:to-ink-800 border border-paper-300/80 dark:border-ink-700/80 p-3.5 shadow-soft-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amberGold-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amberGold-500"></span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="arabic-text text-base font-bold text-ink-900 dark:text-white">
                ہدف یوم:
              </span>
              <span className="font-bold text-amberGold-700 dark:text-amberGold-400 text-base">
                {goalDay} / {goalMaxDays}
              </span>
              <span className="text-[11px] font-medium text-ink-500 dark:text-ink-400 ml-1">
                (Goal Days)
              </span>
            </div>
          </div>

          <button
            onClick={handleOpenEdit}
            className="text-[11px] text-ink-500 dark:text-ink-400 hover:text-sage-700 dark:hover:text-sage-300 flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-paper-200 dark:hover:bg-ink-750 transition-colors tap-bounce"
            title="Set custom spiritual goal"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Set Goal</span>
          </button>
        </div>

        {/* Goal Segmented Progress Bar */}
        <div className="w-full bg-paper-200 dark:bg-ink-700/60 rounded-full h-2 overflow-hidden flex">
          <div
            className="bg-gradient-to-r from-sage-600 via-amberGold-500 to-amberGold-600 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-ink-500 dark:text-ink-400 mt-1 font-medium">
          <span>Day 1 (آغاز)</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amberGold-500" />
            {goalMaxDays - goalDay > 0
              ? `${goalMaxDays - goalDay} days remaining`
              : 'Goal Complete! مبارک'}
          </span>
          <span>Day {goalMaxDays} (تکمیل)</span>
        </div>
      </div>

      {/* Goal Customization Modal */}
      {isEditingGoal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-ink-800 rounded-2xl max-w-sm w-full p-4 border border-paper-300 dark:border-ink-700 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-paper-200 dark:border-ink-700 pb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-sage-600 dark:text-sage-400" />
                <h3 className="text-sm font-bold text-ink-900 dark:text-white">
                  Customize Spiritual Goal
                </h3>
              </div>
              <button
                onClick={() => setIsEditingGoal(false)}
                className="text-ink-400 hover:text-ink-700 dark:hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-3 text-xs">
              {/* Target Duration Selection */}
              <div>
                <label className="font-semibold text-ink-700 dark:text-ink-300 block mb-1">
                  Target Duration (Days):
                </label>
                <div className="flex gap-1.5 mb-2">
                  {PRESET_GOALS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTargetInput(preset.toString())}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all tap-bounce ${
                        targetInput === preset.toString()
                          ? 'bg-sage-600 text-white border-sage-600'
                          : 'bg-paper-100 dark:bg-ink-750 text-ink-700 dark:text-ink-300 border-paper-300 dark:border-ink-650 hover:border-sage-400'
                      }`}
                    >
                      {preset}d
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="Or enter custom days (e.g. 30)"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-paper-300 dark:border-ink-650 bg-white dark:bg-ink-750 text-ink-900 dark:text-white"
                />
              </div>

              {/* Current Day */}
              <div>
                <label className="font-semibold text-ink-700 dark:text-ink-300 block mb-1">
                  Current Day:
                </label>
                <input
                  type="number"
                  min="1"
                  max={targetInput || '365'}
                  value={dayInput}
                  onChange={(e) => setDayInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-paper-300 dark:border-ink-650 bg-white dark:bg-ink-750 text-ink-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-semibold flex items-center justify-center gap-1.5 tap-bounce"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Goal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingGoal(false)}
                  className="px-3 py-2 rounded-xl border border-paper-300 dark:border-ink-650 text-ink-600 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-750"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
