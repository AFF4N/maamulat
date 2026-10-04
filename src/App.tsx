import { useState, useEffect } from 'react';
import { useMaamulat } from './hooks/useMaamulat';
import { Header } from './components/Header';
import { StreakAndHasanat } from './components/StreakAndHasanat';
import { DailyProgressBar } from './components/DailyProgressBar';
import { DailyHistoryTimeline } from './components/DailyHistoryTimeline';
import { MaamulatCategoryCard } from './components/MaamulatCategoryCard';
import { SleepWakeCard } from './components/SleepWakeCard';
import { MurrabiAccountability } from './components/MurrabiAccountability';
import { PrivacyFooter } from './components/PrivacyFooter';
import type { TaskCategory } from './types';

export function App() {
  const {
    state,
    completedTasksCount,
    totalTasksCount,
    todayEarnedHasanat,
    completionPercentage,
    recentHasanatPop,
    toggleTask,
    updateTaskMeasure,
    adjustTakbeerOola,
    setSleepTime,
    setWakeTime,
    setGoalCurrentDay,
    setGoalTargetDays,
    setMurrabiContact,
    simulateNextDay,
    resetToday,
  } = useMaamulat();

  // Dark mode state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('maamulat_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('maamulat_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('maamulat_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // Group tasks by category in traditional order
  const categories: TaskCategory[] = [
    'salah',
    'sunnah',
    'quran',
    'dhikr_morning',
    'dhikr_evening',
    'nawafil',
    'duas',
    'hifazat',
  ];

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-[#121514] text-ink-900 dark:text-[#E8ECE9] transition-colors duration-300">
      {/* Mobile-first centered container with safe-area spacing */}
      <main className="max-w-xl mx-auto px-3.5 sm:px-5 py-4 pb-16 space-y-4">
        {/* 1. Header with Spiritual Goal Tracker & Theme Toggle */}
        <Header
          todayDate={state.todayDate}
          goalDay={state.goalDay || state.chillaDay || 1}
          goalMaxDays={state.goalMaxDays || state.chillaMaxDays || 40}
          onUpdateGoalDay={setGoalCurrentDay}
          onUpdateGoalMaxDays={setGoalTargetDays}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        {/* 2. Streak and Hasanat Stat Cards with Halal Wit / Encouragements */}
        <StreakAndHasanat
          currentStreak={state.streak.current}
          highestStreak={state.streak.highest}
          totalHasanat={state.totalHasanat}
          todayHasanat={todayEarnedHasanat}
        />

        {/* 3. Daily Completion Progress Bar */}
        <DailyProgressBar
          completedCount={completedTasksCount}
          totalCount={totalTasksCount}
          percentage={completionPercentage}
          todayHasanat={todayEarnedHasanat}
        />

        {/* 4. Recent 7-Day History Pills */}
        <DailyHistoryTimeline
          history={state.history}
          completedTodayCount={completedTasksCount}
        />

        {/* 5. Daily Maamulat Task Categories */}
        <div className="space-y-3.5 pt-1">
          {categories.map((cat) => {
            const catTasks = state.tasks.filter((t) => t.category === cat);
            if (catTasks.length === 0) return null;

            return (
              <MaamulatCategoryCard
                key={cat}
                category={cat}
                tasks={catTasks}
                onToggleTask={toggleTask}
                onUpdateTaskMeasure={updateTaskMeasure}
                recentHasanatPopId={recentHasanatPop?.id || null}
                takbeerOola={cat === 'salah' ? state.takbeerOola : undefined}
                onAdjustTakbeerOola={cat === 'salah' ? adjustTakbeerOola : undefined}
              />
            );
          })}
        </div>

        {/* 6. Sleep & Wake Schedule */}
        <SleepWakeCard
          sleepTime={state.sleepTime}
          wakeTime={state.wakeTime}
          onSleepTimeChange={setSleepTime}
          onWakeTimeChange={setWakeTime}
        />

        {/* 7. Murrabi Accountability & WhatsApp Report Generator */}
        <MurrabiAccountability
          state={state}
          onUpdateMurrabiContact={setMurrabiContact}
          currentStreak={state.streak.current}
        />

        {/* 8. Sincere Privacy Statement & Local Tools */}
        <PrivacyFooter
          state={state}
          onSimulateNextDay={simulateNextDay}
          onResetToday={resetToday}
        />
      </main>
    </div>
  );
}

export default App;
