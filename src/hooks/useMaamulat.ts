import { useState, useEffect, useCallback } from 'react';
import type { MaamulatState, DayRecord } from '../types';
import { DEFAULT_TASKS } from '../utils/defaultTasks';
import {
  getTodayLocalDateString,
  formatUrduDate,
  getDayDifference,
} from '../utils/dateUtils';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'maamulat_state_v2';

function getInitialState(): MaamulatState {
  const todayStr = getTodayLocalDateString();

  // Check URL query parameter for ?murrabi=
  let initialMurrabi = '';
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const mParam = params.get('murrabi') || params.get('m');
    if (mParam) {
      initialMurrabi = mParam;
    }
  }

  const defaultState: MaamulatState = {
    version: 2,
    todayDate: todayStr,
    goalDay: 1,
    goalMaxDays: 40,
    streak: {
      current: 1,
      highest: 1,
      lastActiveDate: todayStr,
    },
    totalHasanat: 0,
    takbeerOola: 0,
    sleepTime: '11:30 PM',
    wakeTime: '05:00 AM',
    tasks: DEFAULT_TASKS,
    history: [],
    murrabiContact: initialMurrabi || undefined,
  };

  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
      return defaultState;
    }

    const parsed: any = JSON.parse(stored);

    // Migration from old chillaDay/chillaMaxDays to goalDay/goalMaxDays if needed
    if (parsed.goalDay === undefined) {
      parsed.goalDay = parsed.chillaDay ?? 1;
    }
    if (parsed.goalMaxDays === undefined) {
      parsed.goalMaxDays = parsed.chillaMaxDays ?? 40;
    }

    // If murrabi param was supplied in URL, update state
    if (initialMurrabi && parsed.murrabiContact !== initialMurrabi) {
      parsed.murrabiContact = initialMurrabi;
    }

    // Merge default tasks and refresh static metadata (tooltips, links)
    const mergedTasks = DEFAULT_TASKS.map(dt => {
      const existing = parsed.tasks?.find((t: any) => t.id === dt.id);
      return {
        ...dt,
        urduTitle: existing?.urduTitle || dt.urduTitle,
        englishTitle: existing?.englishTitle || dt.englishTitle,
        customMeasure: existing?.customMeasure || dt.customMeasure,
        completed: existing ? existing.completed : false,
        completedAt: existing ? existing.completedAt : undefined,
      };
    });
    parsed.tasks = mergedTasks;

    // Check for date rollover
    if (parsed.todayDate !== todayStr) {
      return performRollover(parsed, todayStr);
    }

    return parsed as MaamulatState;
  } catch (e) {
    console.error('Error reading localStorage for Maamulat:', e);
    return defaultState;
  }
}

/**
 * Rollover engine: saves previous day to history, updates streak,
 * increments goal day, and resets daily checks.
 */
function performRollover(oldState: MaamulatState, newTodayStr: string): MaamulatState {
  const daysPassed = getDayDifference(newTodayStr, oldState.todayDate);

  // Snapshot the old day
  const completedCount = oldState.tasks.filter(t => t.completed).length;
  const totalCount = oldState.tasks.length;
  const earnedHasanat = oldState.tasks
    .filter(t => t.completed)
    .reduce((sum, t) => sum + t.hasanat, 0);

  const status: 'completed' | 'partial' | 'missed' =
    completedCount >= 14 ? 'completed' : completedCount > 0 ? 'partial' : 'missed';

  const currentGoalDay = oldState.goalDay ?? oldState.chillaDay ?? 1;
  const currentGoalMax = oldState.goalMaxDays ?? oldState.chillaMaxDays ?? 40;

  const oldDayRecord: DayRecord = {
    date: oldState.todayDate,
    urduDate: formatUrduDate(oldState.todayDate),
    goalDay: currentGoalDay,
    goalMaxDays: currentGoalMax,
    completedCount,
    totalCount,
    hasanatEarned: earnedHasanat,
    takbeerOola: oldState.takbeerOola,
    sleepTime: oldState.sleepTime,
    wakeTime: oldState.wakeTime,
    status,
  };

  const updatedHistory = [oldDayRecord, ...(oldState.history || [])].slice(0, 90);

  // Calculate new streak
  let newCurrentStreak = oldState.streak.current;
  const wasConsecutive = daysPassed === 1;
  const qualifiedYesterday = completedCount >= 8; // gentle reasonable threshold (8 of 23)

  if (wasConsecutive) {
    if (qualifiedYesterday) {
      newCurrentStreak += 1;
    } else {
      // Kept open, but didn't meet threshold - preserve at 1 rather than punishing harshly
      newCurrentStreak = 1;
    }
  } else {
    // Gap of more than 1 day
    newCurrentStreak = 1;
  }

  const newHighestStreak = Math.max(oldState.streak.highest, newCurrentStreak);

  // Goal day progresses forward
  let nextGoalDay = currentGoalDay + (daysPassed > 0 ? daysPassed : 1);
  if (nextGoalDay > currentGoalMax) {
    nextGoalDay = currentGoalMax;
  }

  // Reset daily task checks
  const resetTasks = oldState.tasks.map(t => ({
    ...t,
    completed: false,
    completedAt: undefined,
  }));

  const newState: MaamulatState = {
    ...oldState,
    todayDate: newTodayStr,
    goalDay: nextGoalDay,
    goalMaxDays: currentGoalMax,
    streak: {
      current: newCurrentStreak,
      highest: newHighestStreak,
      lastActiveDate: newTodayStr,
    },
    takbeerOola: 0,
    tasks: resetTasks,
    history: updatedHistory,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  } catch (err) {
    console.error('Failed saving rollover to localStorage:', err);
  }

  return newState;
}

export function useMaamulat() {
  const [state, setState] = useState<MaamulatState>(getInitialState);
  const [recentHasanatPop, setRecentHasanatPop] = useState<{ id: string; amount: number } | null>(null);

  // Persist state to localStorage on modification
  const saveState = useCallback((updater: (prev: MaamulatState) => MaamulatState) => {
    setState(prev => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error('Failed to persist Maamulat state:', err);
      }
      return next;
    });
  }, []);

  // Periodic check for calendar midnight rollover while app is left open
  useEffect(() => {
    const interval = setInterval(() => {
      const currentToday = getTodayLocalDateString();
      if (state.todayDate !== currentToday) {
        saveState(prev => performRollover(prev, currentToday));
      }
    }, 60 * 1000); // check every minute

    return () => clearInterval(interval);
  }, [state.todayDate, saveState]);

  // Toggle a single task
  const toggleTask = useCallback((taskId: string) => {
    saveState(prev => {
      const task = prev.tasks.find(t => t.id === taskId);
      if (!task) return prev;

      const isNowCompleted = !task.completed;
      const hasanatDelta = isNowCompleted ? task.hasanat : -task.hasanat;

      if (isNowCompleted) {
        setRecentHasanatPop({ id: taskId, amount: task.hasanat });
        setTimeout(() => setRecentHasanatPop(null), 900);
      }

      const updatedTasks = prev.tasks.map(t =>
        t.id === taskId
          ? {
              ...t,
              completed: isNowCompleted,
              completedAt: isNowCompleted ? new Date().toISOString() : undefined,
            }
          : t
      );

      // Check if all tasks completed!
      const allCompleted = updatedTasks.every(t => t.completed);
      if (allCompleted && !task.completed) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#2D5A43', '#C59438', '#E3EDE7']
          });
        } catch (_) {}
      }

      return {
        ...prev,
        totalHasanat: Math.max(0, prev.totalHasanat + hasanatDelta),
        tasks: updatedTasks,
      };
    });
  }, [saveState]);

  // Takbeer-e-Oola counter (0 to 5)
  const adjustTakbeerOola = useCallback((delta: number) => {
    saveState(prev => {
      const nextVal = Math.min(5, Math.max(0, prev.takbeerOola + delta));
      return {
        ...prev,
        takbeerOola: nextVal,
      };
    });
  }, [saveState]);

  // Sleep time change
  const setSleepTime = useCallback((time: string) => {
    saveState(prev => ({ ...prev, sleepTime: time }));
  }, [saveState]);

  // Wake time change
  const setWakeTime = useCallback((time: string) => {
    saveState(prev => ({ ...prev, wakeTime: time }));
  }, [saveState]);

  // Goal current day manual adjustment
  const setGoalCurrentDay = useCallback((day: number) => {
    saveState(prev => ({
      ...prev,
      goalDay: Math.min(prev.goalMaxDays, Math.max(1, day)),
    }));
  }, [saveState]);

  // Goal target duration adjustment (e.g., 7, 21, 40, 100 days)
  const setGoalTargetDays = useCallback((target: number) => {
    saveState(prev => {
      const sanitized = Math.max(1, Math.min(365, target));
      return {
        ...prev,
        goalMaxDays: sanitized,
        goalDay: Math.min(sanitized, prev.goalDay),
      };
    });
  }, [saveState]);

  // Murrabi contact change
  const setMurrabiContact = useCallback((contact: string) => {
    saveState(prev => ({
      ...prev,
      murrabiContact: contact.trim() || undefined,
    }));
  }, [saveState]);

  // Simulating next day (for testing & verification)
  const simulateNextDay = useCallback(() => {
    saveState(prev => {
      const [y, m, d] = prev.todayDate.split('-').map(Number);
      const nextDate = new Date(y, m - 1, d);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextDateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
      return performRollover(prev, nextDateStr);
    });
  }, [saveState]);

  // Update customizable task measure (e.g. Tilawat portion)
  const updateTaskMeasure = useCallback((taskId: string, measure: string) => {
    saveState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id === taskId) {
          const cleanMeasure = measure.trim() || 'ایک پاؤ';
          return {
            ...t,
            customMeasure: cleanMeasure,
            urduTitle: `تلاوت ( ${cleanMeasure} )`,
            englishTitle: `Tilawat (${cleanMeasure})`,
          };
        }
        return t;
      }),
    }));
  }, [saveState]);

  // Reset today's state
  const resetToday = useCallback(() => {
    saveState(prev => ({
      ...prev,
      takbeerOola: 0,
      tasks: prev.tasks.map(t => ({ ...t, completed: false, completedAt: undefined })),
    }));
  }, [saveState]);

  // Calculated properties
  const completedTasksCount = state.tasks.filter(t => t.completed).length;
  const totalTasksCount = state.tasks.length;
  const todayEarnedHasanat = state.tasks
    .filter(t => t.completed)
    .reduce((sum, t) => sum + t.hasanat, 0);
  const completionPercentage = totalTasksCount > 0
    ? Math.round((completedTasksCount / totalTasksCount) * 100)
    : 0;

  return {
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
    setChillaDay: setGoalCurrentDay, // alias
    setMurrabiContact,
    simulateNextDay,
    resetToday,
  };
}
