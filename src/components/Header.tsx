import React, { useState, useEffect } from 'react';
import { Menu, Sparkles, SlidersHorizontal } from 'lucide-react';
import { formatEnglishDate, formatHijriDate } from '../utils/dateUtils';
import { MenuDrawer } from './MenuDrawer';
import { GoalEditorModal } from './GoalEditorModal';
import type { MaamulatState } from '../types';

interface HeaderProps {
  todayDate: string;
  goalDay: number;
  goalMaxDays: number;
  onUpdateGoalDay: (day: number) => void;
  onUpdateGoalMaxDays: (maxDays: number) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onNavigateToCustomize?: () => void;
  state?: MaamulatState;
  onResetToday?: () => void;
  onResetToDefault?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  todayDate,
  goalDay,
  goalMaxDays,
  onUpdateGoalDay,
  onUpdateGoalMaxDays,
  isDark,
  onToggleTheme,
  onNavigateToCustomize,
  state,
  onResetToday,
  onResetToDefault,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSaveGoal = (targetMax: number, currentDay: number) => {
    onUpdateGoalMaxDays(targetMax);
    onUpdateGoalDay(currentDay);
  };

  const englishDate = formatEnglishDate(todayDate);
  const hijriDate = formatHijriDate(todayDate);
  const progressPercent = Math.min(100, Math.round((goalDay / goalMaxDays) * 100));

  return (
    <header className="relative pt-3 standalone:pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3">
      {/* Fixed Sticky Date Bar (Revealed smoothly on scroll without layout shift or border artifacts) */}
      <div
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 transform bg-paper-50/95 dark:bg-[#121514]/95 backdrop-blur-md border-b border-paper-300/80 dark:border-ink-800 shadow-soft-sm pt-2 standalone:pt-[calc(0.5rem+env(safe-area-inset-top,0px))] pb-2.5 ${
          isScrolled
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-xl mx-auto px-3.5 sm:px-5 flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-ink-900 dark:text-white tracking-tight truncate leading-tight">
              {englishDate}
            </h2>
            {hijriDate && (
              <p className="text-xs font-semibold text-sage-700 dark:text-sage-400 truncate mt-0.5">
                {hijriDate}
              </p>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open settings and navigation menu"
            className="p-1.5 rounded-full border border-paper-300 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-200 hover:text-ink-950 dark:hover:text-white hover:border-sage-400 dark:hover:border-sage-600 transition-all tap-bounce shadow-soft-sm shrink-0 ml-3"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top action row: Tazkiyah & Maamulat on the left, Menu Drawer on the right */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-sage-100 dark:bg-sage-950/60 text-sage-700 dark:text-sage-300 text-sm font-semibold border border-sage-200/80 dark:border-sage-800">
            🌿
          </span>
          <span className="text-xs uppercase tracking-widest font-semibold text-sage-700 dark:text-sage-300">
            Tazkiyah & Maamulat
          </span>
        </div>

        <button
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open settings and navigation menu"
          className="p-2 rounded-full border border-paper-300 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-200 hover:text-ink-950 dark:hover:text-white hover:border-sage-400 dark:hover:border-sage-600 transition-all tap-bounce shadow-soft-sm flex items-center justify-center"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Main In-Page Date Block (Stable, no font-scaling jumps or layout shifts) */}
      <div className="text-left mb-8">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink-900 dark:text-white leading-tight">
          {englishDate}
        </h1>
        {hijriDate && (
          <p className="text-sm sm:text-base font-semibold text-sage-700 dark:text-sage-400 mt-1">
            {hijriDate}
          </p>
        )}
      </div>

      {/* Customizable Spiritual Goal Tracker Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-white to-paper-100 dark:from-ink-850 dark:to-ink-800 border border-paper-300/80 dark:border-ink-700/80 p-3.5 shadow-soft-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amberGold-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amberGold-500"></span>
            </span>
            <div className="flex flex-row-reverse items-center gap-1.5">
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
            onClick={() => setIsEditingGoal(true)}
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
      <GoalEditorModal
        isOpen={isEditingGoal}
        onClose={() => setIsEditingGoal(false)}
        goalDay={goalDay}
        goalMaxDays={goalMaxDays}
        onSave={handleSaveGoal}
      />

      {/* Settings & Navigation Menu Drawer */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigateToCustomize={onNavigateToCustomize || (() => { })}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        goalDay={goalDay}
        goalMaxDays={goalMaxDays}
        onOpenEditGoal={() => setIsEditingGoal(true)}
        state={state}
        onResetToday={onResetToday}
        onResetToDefault={onResetToDefault}
      />
    </header>
  );
};
