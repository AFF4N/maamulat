import React, { useState, useEffect } from 'react';
import { BellRing, CheckCircle2, X } from 'lucide-react';
import type { useMaamulat } from '../hooks/useMaamulat';
import { useRouter } from './useRouter';
import { Header } from '../components/Header';
import { StreakAndHasanat } from '../components/StreakAndHasanat';
import { DailyProgressBar } from '../components/DailyProgressBar';
import { DailyHistoryTimeline } from '../components/DailyHistoryTimeline';
import { MaamulatCategoryCard } from '../components/MaamulatCategoryCard';
import { SleepWakeCard } from '../components/SleepWakeCard';
import { MurrabiAccountability } from '../components/MurrabiAccountability';
import { PrivacyFooter } from '../components/PrivacyFooter';
import { TaskCustomizerScreen } from '../components/TaskCustomizerScreen';
import { ScrollToTop } from '../components/ScrollToTop';
import { formatShortDate } from '../utils/dateUtils';

interface AppRouterProps {
  maamulat: ReturnType<typeof useMaamulat>;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const AppRouter: React.FC<AppRouterProps> = ({
  maamulat,
  isDark,
  onToggleTheme,
}) => {
  const { currentRoute, navigateTo } = useRouter();
  const {
    state,
    selectedDate,
    setSelectedDate,
    isViewingPastDay,
    activeUrduDate,
    activeGoalDay,
    activeGoalMaxDays,
    activeTasks,
    activeSleepTime,
    activeWakeTime,
    activeTakbeerOola,
    activeState,
    completedTasksCount,
    totalTasksCount,
    todayEarnedHasanat,
    completionPercentage,
    recentHasanatPop,
    streakDetails,
    toggleTask,
    updateTaskMeasure,
    updateCategoriesAndTasks,
    resetCategoriesAndTasksToDefault,
    adjustTakbeerOola,
    setSleepTime,
    setWakeTime,
    setGoalCurrentDay,
    setGoalTargetDays,
    setMurrabiContact,
    setHijriAdjustment,
    simulateNextDay,
    restoreBackup,
    resetToday,
  } = maamulat;

  const [showMissingBanner, setShowMissingBanner] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.search.includes('action=missing-reports');
    }
    return false;
  });

  useEffect(() => {
    if (showMissingBanner && typeof window !== 'undefined') {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [showMissingBanner]);

  // 1. Route: /customize (Task & Section Customizer)
  if (currentRoute === '/customize') {
    return (
      <TaskCustomizerScreen
        initialCategories={state.categories}
        initialTasks={state.tasks}
        onSave={(newCategories, newTasks) => {
          updateCategoriesAndTasks(newCategories, newTasks);
        }}
        onResetToDefault={() => {
          resetCategoriesAndTasksToDefault();
        }}
        onBackToHome={() => navigateTo('/')}
      />
    );
  }

  // 2. Home Page (with interactive 7-day selection directly on the main sheet)
  const activeCategories = state.categories && state.categories.length > 0
    ? state.categories.filter((c) => !c.hidden)
    : [];

  const yesterdayDate = state.history && state.history.length > 0
    ? state.history[0]?.date
    : undefined;

  const friendlyDateLabel = isViewingPastDay
    ? formatShortDate(selectedDate)
    : undefined;

  const uncheckedTasks = activeTasks.filter((t) => !t.hidden && !t.completed);

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-[#121514] text-ink-900 dark:text-[#E8ECE9] transition-colors duration-300">
      {/* Mobile-first centered container with safe-area spacing */}
      <main className="max-w-xl mx-auto px-3.5 sm:px-5 py-4 pb-16 space-y-4">
        {/* 1. Header with Spiritual Goal Tracker & Menu Drawer */}
        <Header
          todayDate={selectedDate}
          goalDay={activeGoalDay}
          goalMaxDays={activeGoalMaxDays}
          onUpdateGoalDay={setGoalCurrentDay}
          onUpdateGoalMaxDays={setGoalTargetDays}
          isDark={isDark}
          onToggleTheme={onToggleTheme}
          onNavigateToCustomize={() => navigateTo('/customize')}
          state={state}
          onResetToday={resetToday}
          onResetToDefault={resetCategoriesAndTasksToDefault}
          onUpdateMurrabiContact={setMurrabiContact}
          onUpdateHijriAdjustment={setHijriAdjustment}
          onRestoreBackup={restoreBackup}
          isViewingPastDay={isViewingPastDay}
          isYesterday={selectedDate === yesterdayDate}
          onReturnToToday={() => setSelectedDate(state.todayDate)}
        />

        {/* Missing Reports Notification Banner (Triggered by Web Push Notification tap) */}
        {showMissingBanner && (
          <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-300/80 dark:border-amber-700/60 shadow-soft-sm space-y-2.5 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                  {uncheckedTasks.length === 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <BellRing className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-ink-900 dark:text-white">
                    {uncheckedTasks.length === 0
                      ? 'All Reports Complete! 🎉'
                      : `Missing Reports Check (${uncheckedTasks.length} Pending)`}
                  </h3>
                  <p className="arabic-text text-xs text-sage-700 dark:text-sage-400">
                    {uncheckedTasks.length === 0
                      ? 'ماشاء اللہ! آج کے تمام معمولات مکمل ہو چکے ہیں۔'
                      : 'آج کے نامکمل معمولات کا جائزہ'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMissingBanner(false)}
                aria-label="Dismiss banner"
                className="p-1 rounded-lg text-ink-400 hover:text-ink-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uncheckedTasks.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] text-ink-600 dark:text-ink-300">
                  You still have pending items recorded for today. Tap each to complete:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {uncheckedTasks.map((task) => (
                    <span
                      key={task.id}
                      className="px-2 py-0.5 rounded-lg bg-white/90 dark:bg-ink-850/90 border border-amber-200 dark:border-ink-700 text-[11px] font-medium text-ink-800 dark:text-ink-200 shadow-2xs"
                    >
                      {task.urduTitle || task.englishTitle}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Great discipline! You have completed all recorded items for this date.
              </p>
            )}
          </div>
        )}

        {/* 2. Streak and Hasanat Stat Cards with Halal Wit / Encouragements */}
        <StreakAndHasanat
          currentStreak={state.streak.current}
          highestStreak={state.streak.highest}
          totalHasanat={state.totalHasanat}
          todayHasanat={todayEarnedHasanat}
          dateLabel={friendlyDateLabel}
          isTodayQualified={streakDetails.isTodayQualified}
          neededForToday={streakDetails.neededForToday}
        />

        {/* 3. Daily Completion Progress Bar (shows 4 Oct's Progress when viewing 4 Oct) */}
        <DailyProgressBar
          completedCount={completedTasksCount}
          totalCount={totalTasksCount}
          percentage={completionPercentage}
          todayHasanat={todayEarnedHasanat}
          dateLabel={friendlyDateLabel}
          isViewingPastDay={isViewingPastDay}
        />

        {/* 4. Recent 7-Day History Pills: Click any day to view & edit that day's sheet */}
        <DailyHistoryTimeline
          history={state.history}
          todayDate={state.todayDate}
          completedTodayCount={
            selectedDate === state.todayDate
              ? completedTasksCount
              : state.tasks.filter((t) => !t.hidden && t.completed).length
          }
          totalTodayCount={totalTasksCount}
          isTodayQualified={streakDetails.isTodayQualified}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {/* 5. Daily Maamulat Task Categories (renders active date's tasks) */}
        <div className="space-y-3.5 pt-1">
          {activeCategories.map((catConfig) => {
            const catTasks = activeTasks.filter((t) => t.category === catConfig.id && !t.hidden);
            if (catTasks.length === 0) return null;

            return (
              <MaamulatCategoryCard
                key={catConfig.id}
                category={catConfig.id}
                categoryConfig={catConfig}
                tasks={catTasks}
                onToggleTask={toggleTask}
                onUpdateTaskMeasure={updateTaskMeasure}
                recentHasanatPopId={recentHasanatPop?.id || null}
                takbeerOola={catConfig.id === 'salah' ? activeTakbeerOola : undefined}
                onAdjustTakbeerOola={catConfig.id === 'salah' ? adjustTakbeerOola : undefined}
              />
            );
          })}
        </div>

        {/* 6. Sleep & Wake Schedule (reflects active date) */}
        <SleepWakeCard
          sleepTime={activeSleepTime}
          wakeTime={activeWakeTime}
          onSleepTimeChange={setSleepTime}
          onWakeTimeChange={setWakeTime}
        />

        {/* 7. Murrabi Accountability & WhatsApp Report Generator (shares active date's report) */}
        <MurrabiAccountability
          state={activeState}
          onUpdateMurrabiContact={setMurrabiContact}
          currentStreak={state.streak.current}
          isViewingPastDay={isViewingPastDay}
          activeDateLabel={selectedDate === yesterdayDate ? 'Yesterday (کل)' : friendlyDateLabel || activeUrduDate}
          onSelectYesterday={yesterdayDate ? () => setSelectedDate(yesterdayDate) : undefined}
        />

        {/* 8. Sincere Privacy Statement & Local Tools */}
        <PrivacyFooter
          state={state}
          onSimulateNextDay={simulateNextDay}
          onResetToday={resetToday}
        />

        {/* Floating Scroll To Top Button */}
        <ScrollToTop />
      </main>
    </div>
  );
};

export default AppRouter;
