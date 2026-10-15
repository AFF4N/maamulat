import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, RefreshCw, Info } from 'lucide-react';
import { ENCOURAGEMENT_QUOTES } from '../utils/defaultTasks';
import { STREAK_PASS_PERCENTAGE } from '../constants';
import { Tooltip } from './Tooltip';

interface StreakAndHasanatProps {
  currentStreak: number;
  highestStreak: number;
  totalHasanat: number;
  todayHasanat: number;
  dateLabel?: string;
  isTodayQualified?: boolean;
  neededForToday?: number;
}

export const StreakAndHasanat: React.FC<StreakAndHasanatProps> = ({
  currentStreak,
  highestStreak,
  totalHasanat,
  todayHasanat,
  dateLabel,
  isTodayQualified,
  neededForToday,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [showThresholdTip, setShowThresholdTip] = useState(false);

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
        <div className="rounded-2xl p-3 sm:p-3.5 bg-white dark:bg-ink-800 border border-paper-300 dark:border-ink-700/80 shadow-soft-sm relative group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-ink-500 dark:text-ink-400">
              Current Streak
            </span>
            <span className="p-1 rounded-full bg-amberGold-50 dark:bg-amberGold-950/40 text-amberGold-600 dark:text-amberGold-400">
              <Flame className="w-3.5 h-3.5 fill-amberGold-500 text-amberGold-600 animate-pulse" />
            </span>
          </div>

          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-ink-900 dark:text-white tracking-tight">
              {currentStreak}
            </span>
            <span className="text-xs font-semibold text-ink-600 dark:text-ink-300">
              {currentStreak === 1 ? 'Day' : 'Days'}
            </span>
          </div>

          <div className="mt-1.5 flex items-center justify-between text-[10px] text-ink-500 dark:text-ink-400">
            <span>
              Best: <span className="font-semibold text-ink-700 dark:text-ink-200">{highestStreak} {highestStreak === 1 ? 'day' : 'days'}</span>
            </span>

            {isTodayQualified !== undefined && (
              <div className="relative inline-flex items-center gap-1">
                {isTodayQualified ? (
                  <>
                    <span className="font-bold text-sage-600 dark:text-sage-400">
                      ✓ Passed
                    </span>
                    <span
                      onMouseEnter={() => setShowThresholdTip(true)}
                      onMouseLeave={() => setShowThresholdTip(false)}
                      className="p-0.5 rounded-full text-ink-400 hover:text-sage-600 dark:hover:text-sage-300 cursor-help inline-flex items-center"
                      aria-label="Streak threshold info"
                    >
                      <Info className="w-3 h-3" />
                    </span>
                  </>
                ) : neededForToday && neededForToday > 0 ? (
                  <>
                    <span className="font-medium text-amberGold-700 dark:text-amberGold-400">
                      {neededForToday} left
                    </span>
                    <span
                      onMouseEnter={() => setShowThresholdTip(true)}
                      onMouseLeave={() => setShowThresholdTip(false)}
                      className="p-0.5 rounded-full text-ink-400 hover:text-amberGold-600 dark:hover:text-amberGold-400 cursor-help inline-flex items-center"
                      aria-label="Streak threshold info"
                    >
                      <Info className="w-3 h-3" />
                    </span>
                  </>
                ) : null}

                {/* Simple hover tooltip */}
                <Tooltip
                  isOpen={showThresholdTip}
                  position="above"
                  align="center"
                  arrowPosition="center"
                  className="w-36 text-[9.5px]"
                >
                  <span>
                    <strong className="text-amberGold-600 dark:text-amberGold-400 font-semibold">≥{STREAK_PASS_PERCENTAGE}%</strong> daily tasks needed to pass & extend.
                  </span>
                </Tooltip>
              </div>
            )}
          </div>
        </div>

        {/* Hasanat Card */}
        <div className="rounded-2xl p-3 sm:p-3.5 bg-white dark:bg-ink-800 border border-paper-300 dark:border-ink-700/80 shadow-soft-sm relative group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-ink-500 dark:text-ink-400">
              Total Hasanat
            </span>
            <span className="p-1 rounded-full bg-sage-50 dark:bg-sage-950/40 text-sage-600 dark:text-sage-400">
              <Sparkles className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
            </span>
          </div>

          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-ink-900 dark:text-white tracking-tight">
              {totalHasanat.toLocaleString()}
            </span>
          </div>

          <div className="mt-1.5 flex items-center justify-between text-[10px] text-ink-500 dark:text-ink-400">
            <span>
              {dateLabel ? `${dateLabel}:` : 'Today:'}{' '}
              <span className="font-semibold text-sage-700 dark:text-sage-300">+{todayHasanat}</span>
            </span>
            <span className="text-ink-400 truncate">Sincerity</span>
          </div>
        </div>
      </div>

      {/* Warm Halal Wit & Encouragement Bar (Fixed 2 lines to prevent truncation) */}
      <div
        onClick={rotateQuote}
        className="cursor-pointer select-none rounded-xl px-3.5 py-2.5 bg-paper-100/90 dark:bg-ink-800/60 border border-paper-300/60 dark:border-ink-700/60 flex items-center justify-between gap-2.5 text-xs text-ink-700 dark:text-ink-300 hover:border-sage-300 dark:hover:border-sage-700 transition-colors tap-bounce"
        title="Tap for another encouragement"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm shrink-0">💬</span>
          <p
            className={`italic transition-opacity duration-200 line-clamp-2 leading-snug min-h-[2.4rem] flex items-center ${
              fade ? 'opacity-100' : 'opacity-0'
            }`}
          >
            "{currentQuote.quote}"
          </p>
        </div>
        <RefreshCw className="w-3.5 h-3.5 text-ink-400 opacity-60 shrink-0 hover:rotate-180 transition-transform duration-300" />
      </div>
    </div>
  );
};
