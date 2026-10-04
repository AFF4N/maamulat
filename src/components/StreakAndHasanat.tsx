import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, RefreshCw } from 'lucide-react';
import { ENCOURAGEMENT_QUOTES } from '../utils/defaultTasks';

interface StreakAndHasanatProps {
  currentStreak: number;
  highestStreak: number;
  totalHasanat: number;
  todayHasanat: number;
}

export const StreakAndHasanat: React.FC<StreakAndHasanatProps> = ({
  currentStreak,
  highestStreak,
  totalHasanat,
  todayHasanat,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const rotateQuote = () => {
    setFade(false);
    setTimeout(() => {
      setQuoteIndex(prev => (prev + 1) % ENCOURAGEMENT_QUOTES.length);
      setFade(true);
    }, 180);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      rotateQuote();
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const currentQuote = ENCOURAGEMENT_QUOTES[quoteIndex];

  return (
    <div className="space-y-2.5 my-3">
      {/* 2-Column Stat Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Streak Card */}
        <div className="rounded-2xl p-3.5 bg-white dark:bg-ink-800 border border-paper-300 dark:border-ink-700/80 shadow-soft-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-ink-500 dark:text-ink-400">
              Current Streak
            </span>
            <span className="p-1.5 rounded-full bg-amberGold-50 dark:bg-amberGold-950/40 text-amberGold-600 dark:text-amberGold-400">
              <Flame className="w-4 h-4 fill-amberGold-500 text-amberGold-600 animate-pulse" />
            </span>
          </div>

          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-ink-900 dark:text-white tracking-tight">
              {currentStreak}
            </span>
            <span className="text-xs font-semibold text-ink-600 dark:text-ink-300">
              {currentStreak === 1 ? 'Day' : 'Days'}
            </span>
          </div>

          <div className="mt-1 text-[10px] text-ink-500 dark:text-ink-400">
            Personal Best: <span className="font-semibold text-ink-700 dark:text-ink-200">{highestStreak} days</span>
          </div>
        </div>

        {/* Hasanat Card */}
        <div className="rounded-2xl p-3.5 bg-white dark:bg-ink-800 border border-paper-300 dark:border-ink-700/80 shadow-soft-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-ink-500 dark:text-ink-400">
              Total Hasanat
            </span>
            <span className="p-1.5 rounded-full bg-sage-50 dark:bg-sage-950/40 text-sage-600 dark:text-sage-400">
              <Sparkles className="w-4 h-4 text-sage-600 dark:text-sage-400" />
            </span>
          </div>

          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-ink-900 dark:text-white tracking-tight">
              {totalHasanat.toLocaleString()}
            </span>
            <span className="text-[10px] uppercase font-bold text-sage-700 dark:text-sage-300 bg-sage-100 dark:bg-sage-900/60 px-1.5 py-0.5 rounded-md">
              +{todayHasanat} today
            </span>
          </div>

          <div className="mt-1 text-[10px] text-ink-500 dark:text-ink-400">
            Recorded privately with sincerity
          </div>
        </div>
      </div>

      {/* Warm Halal Wit & Encouragement Bar */}
      <div
        onClick={rotateQuote}
        className="cursor-pointer select-none rounded-xl px-3.5 py-2 bg-paper-100/90 dark:bg-ink-800/60 border border-paper-300/60 dark:border-ink-700/60 flex items-center justify-between gap-2 text-xs text-ink-700 dark:text-ink-300 hover:border-sage-300 dark:hover:border-sage-700 transition-colors"
        title="Tap for another encouragement"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-sm">💬</span>
          <p
            className={`italic transition-opacity duration-200 truncate ${
              fade ? 'opacity-100' : 'opacity-0'
            }`}
          >
            "{currentQuote.quote}"
          </p>
        </div>
        <RefreshCw className="w-3 h-3 text-ink-400 opacity-60 flex-shrink-0 hover:rotate-180 transition-transform duration-300" />
      </div>
    </div>
  );
};
