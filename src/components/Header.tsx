import React, { useState, useEffect } from 'react';
import { Menu, Sparkles, SlidersHorizontal, RotateCcw, Clock, Trophy, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatEnglishDate, formatHijriDate } from '../utils/dateUtils';
import { isCompletionQualified, STREAK_PASS_PERCENTAGE } from '../constants';
import { MenuDrawer } from './MenuDrawer';
import { GoalEditorModal } from './GoalEditorModal';
import type { MaamulatState } from '../types';

interface HeaderProps {
  todayDate: string;
  goalDay: number;
  goalMaxDays: number;
  onUpdateGoalDay: (day: number) => void;
  onUpdateGoalMaxDays: (maxDays: number) => void;
  onUpdateSyncGoalWithStreak?: (sync: boolean) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onNavigateToCustomize?: () => void;
  onNavigateToAdmin?: () => void;
  state?: MaamulatState;
  onResetToday?: () => void;
  onResetToDefault?: () => void;
  onUpdateMurrabiContact?: (contact: string) => void;
  onUpdateHijriAdjustment?: (adjustment: number) => void;
  onRestoreBackup?: (backup: MaamulatState) => void;
  isViewingPastDay?: boolean;
  isYesterday?: boolean;
  onReturnToToday?: () => void;
  completedCount?: number;
  totalCount?: number;
  completionPercentage?: number;
}

export const Header: React.FC<HeaderProps> = ({
  todayDate,
  goalDay,
  goalMaxDays,
  onUpdateGoalDay,
  onUpdateGoalMaxDays,
  onUpdateSyncGoalWithStreak,
  isDark,
  onToggleTheme,
  onNavigateToCustomize,
  onNavigateToAdmin,
  state,
  onResetToday,
  onResetToDefault,
  onUpdateMurrabiContact,
  onUpdateHijriAdjustment,
  onRestoreBackup,
  isViewingPastDay = false,
  isYesterday = false,
  onReturnToToday,
  completedCount,
  totalCount,
  completionPercentage,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [showGoalGreetingModal, setShowGoalGreetingModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSaveGoal = (targetMax: number, currentDay: number) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`maamulat_goal_greeted_${todayDate}_${currentDay}_${targetMax}`);
    }
    onUpdateGoalMaxDays(targetMax);
    onUpdateGoalDay(currentDay);
  };

  const handleResetGoalToDayOne = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`maamulat_goal_greeted_${todayDate}_${goalMaxDays}_${goalMaxDays}`);
    }
    onUpdateGoalDay(1);
    setShowGoalGreetingModal(false);
  };

  const englishDate = formatEnglishDate(todayDate);
  const hijriDate = formatHijriDate(todayDate, state?.hijriAdjustment ?? 0);
  const progressPercent = Math.min(100, Math.round((goalDay / goalMaxDays) * 100));

  const safeTotalCount = totalCount ?? 0;
  const safeCompletedCount = completedCount ?? 0;
  const isPassed = isCompletionQualified(safeCompletedCount, safeTotalCount);
  const taskProgressPercent = safeTotalCount > 0
    ? Math.min(100, Math.max(0, Math.round((safeCompletedCount / safeTotalCount) * 100)))
    : (completionPercentage ?? 0);

  const isGoalReached = goalDay >= goalMaxDays;

  // Trigger celebratory greeting modal & confetti when goal is reached (7/7 or overflow)
  useEffect(() => {
    if (isViewingPastDay) return;
    if (goalDay >= goalMaxDays) {
      const milestoneKey = `maamulat_goal_greeted_${todayDate}_${goalDay}_${goalMaxDays}`;
      if (typeof window !== 'undefined' && !localStorage.getItem(milestoneKey)) {
        localStorage.setItem(milestoneKey, '1');
        setShowGoalGreetingModal(true);
        try {
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#2D5A43', '#C59438', '#E3EDE7'],
          });
        } catch { }
      }
    }
  }, [goalDay, goalMaxDays, isViewingPastDay, todayDate]);

  return (
    <header className="relative pt-1 standalone:pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3">
      {/* Fixed Sticky Date Bar with Selection Progress Bar & Border Line */}
      <div
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 transform bg-paper-50/95 dark:bg-[#121514]/95 backdrop-blur-md border-b border-paper-300/80 dark:border-ink-800 shadow-soft-sm pt-2.5 standalone:pt-[calc(0.5rem+env(safe-area-inset-top,0px))] pb-2.5 ${isScrolled
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-full opacity-0 pointer-events-none'
          }`}
      >
        <div className="max-w-xl mx-auto px-3.5 sm:px-5 flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-ink-900 dark:text-white tracking-tight truncate leading-tight">
                {englishDate}
              </h2>
              {isViewingPastDay && (
                <span
                  title={isYesterday ? 'Yesterday (سابقہ دن)' : 'Historic date (سابقہ دن)'}
                  className="inline-flex items-center justify-center p-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300/80 dark:border-amber-700/60 shrink-0"
                  aria-label="Viewing historic date"
                >
                  <Clock className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            {hijriDate && (
              <p className="text-xs font-semibold text-sage-700 dark:text-sage-400 truncate mt-0.5">
                {hijriDate}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            {isViewingPastDay && onReturnToToday && (
              <button
                type="button"
                onClick={onReturnToToday}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sage-100 hover:bg-sage-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-sage-800 dark:text-sage-200 border border-sage-300 dark:border-ink-700 text-[11px] font-bold transition-all tap-bounce shadow-soft-sm"
                title="Return to today"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Today</span>
              </button>
            )}
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open settings and navigation menu"
              className="p-1.5 rounded-full border border-paper-300 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-200 hover:text-ink-950 dark:hover:text-white hover:border-sage-400 dark:hover:border-sage-600 transition-all tap-bounce shadow-soft-sm shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selection Progress Border Bar: partial yellow when below pass threshold (60%), transitions to green on passing */}
        <div
          className="absolute -bottom-[1px] left-0 right-0 w-full h-[3px] bg-paper-200/90 dark:bg-ink-800/90 overflow-hidden"
          role="progressbar"
          aria-valuenow={taskProgressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Daily tasks selection progress"
        >
          {/* Subtle 60% pass threshold marker */}
          <span
            className="absolute top-0 bottom-0 left-[60%] w-[1.5px] bg-ink-400/30 dark:bg-white/20 z-10 pointer-events-none"
            title={`Pass threshold (${STREAK_PASS_PERCENTAGE}%)`}
          />
          <div
            className={`h-full transition-all duration-500 ease-out ${isPassed
              ? 'bg-sage-500 dark:bg-sage-400 shadow-[0_0_8px_rgba(58,116,86,0.6)]'
              : 'bg-amberGold-500 dark:bg-amberGold-400 shadow-[0_0_8px_rgba(201,147,59,0.5)]'
              }`}
            style={{ width: `${taskProgressPercent}%` }}
          />
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

      {/* Main In-Page Date Block (Title with clock icon, clean and uncrowded at top) */}
      <div className="text-left mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink-900 dark:text-white leading-tight">
          <span>{englishDate}</span>
          {isViewingPastDay && (
            <span
              title={isYesterday ? 'Yesterday (سابقہ دن)' : 'Historic date (سابقہ دن)'}
              className="inline-flex items-center justify-center p-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-300/80 dark:border-amber-700/60 ml-2 align-middle"
              aria-label="Viewing historic date"
            >
              <Clock className="w-3 h-3" />
            </span>
          )}
        </h1>
        {hijriDate && (
          <p className="text-sm sm:text-base font-semibold text-sage-700 dark:text-sage-400 mt-1">
            {hijriDate}
          </p>
        )}
      </div>

      {/* Customizable Spiritual Goal Tracker Banner */}
      <div
        className={`rounded-2xl bg-gradient-to-br p-3.5 shadow-soft-sm border transition-colors ${isGoalReached
          ? 'from-amberGold-50/90 via-white to-sage-50/80 dark:from-ink-850 dark:via-ink-800 dark:to-sage-950/30 border-amberGold-300 dark:border-amberGold-700/70'
          : 'from-white to-paper-100 dark:from-ink-850 dark:to-ink-800 border-paper-300/80 dark:border-ink-700/80'
          }`}
      >
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
            title="Set custom goal"
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

        {/* Inline Goal Reached Greeting & Action Prompt */}
        {isGoalReached && (
          <div className="mt-3 pt-2.5 border-t border-amberGold-200/80 dark:border-amberGold-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-fadeIn">
            <div className="flex items-start gap-2 min-w-0">
              <span className="p-1.5 rounded-xl bg-amberGold-100 dark:bg-amberGold-950/60 text-amberGold-700 dark:text-amberGold-400 shrink-0 mt-0.5">
                <Trophy className="w-3.5 h-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-ink-900 dark:text-white leading-snug">
                  Masha&apos;Allah! {goalMaxDays}-Day Goal Reached 🎉
                </p>
                <p className="text-[11px] text-ink-600 dark:text-ink-300 leading-snug mt-0.5">
                  Reset for a fresh cycle or set a new goal anytime.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleResetGoalToDayOne}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white dark:bg-ink-800 hover:bg-paper-100 dark:hover:bg-ink-700 text-ink-800 dark:text-ink-200 border border-paper-300 dark:border-ink-650 transition-all tap-bounce shadow-soft-sm"
              >
                <RotateCcw className="w-3 h-3 text-amberGold-600" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditingGoal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-sage-600 hover:bg-sage-700 text-white transition-all tap-bounce shadow-soft-sm"
              >
                <Target className="w-3 h-3" />
                <span>New Goal</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Celebratory Goal Reached Greeting Modal */}
      {showGoalGreetingModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Goal Reached Celebration"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-backdrop"
        >
          <div className="bg-white dark:bg-ink-800 rounded-2xl max-w-sm w-full p-5 border border-amberGold-300 dark:border-amberGold-700/80 shadow-xl space-y-4 text-center animate-modal-in">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-amberGold-100 dark:bg-amberGold-950/60 border border-amberGold-200 dark:border-amberGold-800 flex items-center justify-center text-amberGold-600 dark:text-amberGold-400 shadow-sm">
              <Trophy className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <p className="arabic-text text-lg font-bold text-amberGold-700 dark:text-amberGold-400">
                ماشاء اللہ! بارک اللہ فیکم 🎉
              </p>
              <h3 className="text-base font-extrabold text-ink-900 dark:text-white">
                Goal Reached! ({goalDay}/{goalMaxDays})
              </h3>
              <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed pt-1">
                Congratulations on reaching your <strong>{goalMaxDays}-day</strong> consistency target! May Allah accept your steadfastness (<em>Istiqaamah</em>). Would you like to reset this goal to Day 1 or set a new target?
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowGoalGreetingModal(false);
                  setIsEditingGoal(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors tap-bounce shadow-sm"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Set New Goal</span>
              </button>

              <button
                type="button"
                onClick={handleResetGoalToDayOne}
                className="w-full py-2.5 px-4 rounded-xl bg-amberGold-50 dark:bg-amberGold-950/40 hover:bg-amberGold-100 dark:hover:bg-amberGold-900/50 text-amberGold-800 dark:text-amberGold-300 border border-amberGold-200 dark:border-amberGold-800/70 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors tap-bounce"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Goal to Day 1</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGoalGreetingModal(false)}
                className="w-full py-2 px-3 rounded-xl text-[11px] font-semibold text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
        onNavigateToAdmin={onNavigateToAdmin}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        goalDay={goalDay}
        goalMaxDays={goalMaxDays}
        onOpenEditGoal={() => setIsEditingGoal(true)}
        state={state}
        onResetToday={onResetToday}
        onResetToDefault={onResetToDefault}
        onUpdateMurrabiContact={onUpdateMurrabiContact}
        onUpdateHijriAdjustment={onUpdateHijriAdjustment}
        onUpdateSyncGoalWithStreak={onUpdateSyncGoalWithStreak}
        onRestoreBackup={onRestoreBackup}
      />
    </header>
  );
};
