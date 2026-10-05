import React, { useState, useEffect } from 'react';
import { Target, Check } from 'lucide-react';

interface GoalEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalDay: number;
  goalMaxDays: number;
  onSave: (targetMax: number, currentDay: number) => void;
}

const PRESET_GOALS = [7, 21, 40, 100];

export const GoalEditorModal: React.FC<GoalEditorModalProps> = ({
  isOpen,
  onClose,
  goalDay,
  goalMaxDays,
  onSave,
}) => {
  const [dayInput, setDayInput] = useState(goalDay.toString());
  const [targetInput, setTargetInput] = useState(goalMaxDays.toString());

  useEffect(() => {
    if (isOpen) {
      setDayInput(goalDay.toString());
      setTargetInput(goalMaxDays.toString());
    }
  }, [isOpen, goalDay, goalMaxDays]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseInt(targetInput, 10);
    const parsedDay = parseInt(dayInput, 10);

    if (!isNaN(parsedTarget) && parsedTarget >= 1) {
      const validDay = !isNaN(parsedDay) && parsedDay >= 1 ? Math.min(parsedTarget, parsedDay) : 1;
      onSave(parsedTarget, validDay);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Customize Spiritual Goal"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="bg-white dark:bg-ink-800 rounded-2xl max-w-sm w-full p-4 border border-paper-300 dark:border-ink-700 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between border-b border-paper-200 dark:border-ink-700 pb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-sage-600 dark:text-sage-400" />
            <h3 className="text-sm font-bold text-ink-900 dark:text-white">
              Customize Spiritual Goal
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-ink-400 hover:text-ink-700 dark:hover:text-white text-xs p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Target Duration Selection */}
          <div>
            <label htmlFor="goal-target-input" className="font-semibold text-ink-700 dark:text-ink-300 block mb-1">
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
              id="goal-target-input"
              type="number"
              min="1"
              max="365"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="Or enter custom days (e.g. 30)"
              className="w-full px-2.5 py-1.5 rounded-lg border border-paper-300 dark:border-ink-650 bg-white dark:bg-ink-750 text-ink-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sage-500"
            />
          </div>

          {/* Current Day */}
          <div>
            <label htmlFor="goal-current-day-input" className="font-semibold text-ink-700 dark:text-ink-300 block mb-1">
              Current Day:
            </label>
            <input
              id="goal-current-day-input"
              type="number"
              min="1"
              max={targetInput || '365'}
              value={dayInput}
              onChange={(e) => setDayInput(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-paper-300 dark:border-ink-650 bg-white dark:bg-ink-750 text-ink-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sage-500"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-semibold flex items-center justify-center gap-1.5 tap-bounce transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Goal</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl border border-paper-300 dark:border-ink-650 text-ink-600 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-750 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
