import React from 'react';
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
import { PastDayAlertBanner } from '../components/PastDayAlertBanner';
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
    simulateNextDay,
    resetToday,
  } = maamulat;

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
        />

        {/* 2. Streak and Hasanat Stat Cards with Halal Wit / Encouragements */}
        <StreakAndHasanat
          currentStreak={state.streak.current}
          highestStreak={state.streak.highest}
          totalHasanat={state.totalHasanat}
          todayHasanat={todayEarnedHasanat}
          dateLabel={friendlyDateLabel}
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
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {/* 4b. Alert banner when viewing a past day */}
        {isViewingPastDay && (
          <PastDayAlertBanner
            dateLabel={friendlyDateLabel || selectedDate}
            isYesterday={selectedDate === yesterdayDate}
            onReturnToToday={() => setSelectedDate(state.todayDate)}
          />
        )}

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
