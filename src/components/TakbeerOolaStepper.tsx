import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface TakbeerOolaStepperProps {
  value: number;
  max?: number;
  onChange: (delta: number) => void;
}

export const TakbeerOolaStepper: React.FC<TakbeerOolaStepperProps> = ({
  value,
  max = 5,
  onChange,
}) => {
  return (
    <div className="p-3.5 rounded-xl border border-amberGold-200 dark:border-amberGold-900/60 bg-gradient-to-r from-amberGold-50/50 to-white dark:from-ink-850 dark:to-ink-800 flex items-center justify-between">
      <div className="min-w-0 pr-2">
        <div className="flex items-start gap-1.5">
          <span className="text-sm mt-0.5">🔸</span>
          <div className="flex flex-col">
            <span className="arabic-text text-left font-bold text-ink-900 dark:text-white leading-tight whitespace-nowrap">
              تکبیرِ اولیٰ
            </span>
            <span className="text-xs text-ink-500 dark:text-ink-400 font-medium whitespace-nowrap">
              (Takbeer-e-Oola)
            </span>
          </div>
        </div>
        <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5">
          Joining with the Imam at the opening Takbeer
        </p>

        {/* 5 Dot Visual Indicators */}
        <div className="flex items-center gap-1.5 mt-2">
          {Array.from({ length: max }).map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${i < value
                  ? 'w-4 bg-amberGold-500'
                  : 'w-2 bg-paper-300 dark:bg-ink-700'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Stepper Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onChange(-1)}
          disabled={value <= 0}
          aria-label="Decrease Takbeer-e-Oola count"
          className="w-8 h-8 rounded-lg border border-paper-300 dark:border-ink-650 bg-white dark:bg-ink-750 text-ink-700 dark:text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-paper-100 dark:hover:bg-ink-700 transition-colors tap-bounce"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <span className="w-10 text-center font-bold text-base text-ink-900 dark:text-white">
          {value} / {max}
        </span>

        <button
          onClick={() => onChange(1)}
          disabled={value >= max}
          aria-label="Increase Takbeer-e-Oola count"
          className="w-8 h-8 rounded-lg border border-paper-300 dark:border-ink-650 bg-white dark:bg-ink-750 text-ink-700 dark:text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-paper-100 dark:hover:bg-ink-700 transition-colors tap-bounce"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
