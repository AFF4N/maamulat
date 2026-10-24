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
import { AdminDashboard } from '../components/admin/AdminDashboard';
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

  // 2. Admin Portal & Management Dashboard
  if (currentRoute === '/admin') {
    return (
      <AdminDashboard
        onBack={() => navigateTo('/')}
        isDark={isDark}
      />
    );
  }

  // 3. Home Page (with interactive 7-day selection directly on the main sheet)
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
          onNavigateToAdmin={() => navigateTo('/admin')}
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

        {/* Floating Missing Reports Toast (Triggered on click to notification) */}
        {showMissingBanner && (
          <div
            role="alert"
            aria-live="polite"
            className="fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-lg bg-white/95 dark:bg-[#121514]/95 backdrop-blur-2xl text-ink-900 dark:text-white border border-paper-300 dark:border-ink-800 shadow-[0_15px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl p-4 sm:p-4.5 space-y-3 transition-all animate-in fade-in slide-in-from-bottom-5 duration-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                    uncheckedTasks.length === 0
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/80'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/80'
                  }`}
                >
                  {uncheckedTasks.length === 0 ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <BellRing className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-ink-900 dark:text-white tracking-tight">
                      {uncheckedTasks.length === 0 ? 'All Reports Complete! 🎉' : 'Missing Daily Reports'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        uncheckedTasks.length === 0
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                          : 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                      }`}
                    >
                      {uncheckedTasks.length === 0 ? 'مکمل' : `${uncheckedTasks.length} Pending`}
                    </span>
                  </div>

                  <p className="arabic-text text-xs text-sage-700 dark:text-sage-300 mt-0.5">
                    {uncheckedTasks.length === 0
                      ? 'ماشاء اللہ! آج کے تمام معمولات مکمل ہو چکے ہیں۔'
                      : 'آج کے نامکمل معمولات کی فہرست'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMissingBanner(false)}
                aria-label="Close notification"
                className="p-1 rounded-lg text-ink-400 hover:text-ink-800 dark:text-white/50 dark:hover:text-white hover:bg-paper-100 dark:hover:bg-white/10 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uncheckedTasks.length > 0 ? (
              <div className="space-y-2 pt-1 border-t border-paper-200 dark:border-white/10">
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {uncheckedTasks.map((task) => (
                    <span
                      key={task.id}
                      className="px-2.5 py-1 rounded-lg bg-paper-100 dark:bg-white/10 hover:bg-paper-200 dark:hover:bg-white/15 border border-paper-300/80 dark:border-white/10 text-[11px] font-medium text-ink-800 dark:text-white/90 backdrop-blur-sm transition-colors"
                    >
                      {task.urduTitle || task.englishTitle}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-ink-500 dark:text-white/60">
                    Tap any habit on your sheet to record it
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMissingBanner(false);
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                    className="text-[11px] font-bold px-3 py-1 rounded-xl bg-sage-600 hover:bg-sage-500 text-white transition-colors tap-bounce shadow-sm"
                  >
                    Complete Now ↓
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-1 border-t border-paper-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Great habit discipline! Keep up your daily streak.
                </span>
                <button
                  type="button"
                  onClick={() => setShowMissingBanner(false)}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-paper-100 hover:bg-paper-200 dark:bg-white/10 dark:hover:bg-white/20 text-ink-800 dark:text-white transition-colors"
                >
                  Close
                </button>
              </div>
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
