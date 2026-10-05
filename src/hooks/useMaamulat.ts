import { useState, useEffect, useCallback, useMemo } from 'react';
import type { MaamulatState, DayRecord, CategoryConfig, MaamulatTask } from '../types';
import { DEFAULT_TASKS, DEFAULT_CATEGORIES } from '../utils/defaultTasks';
import {
  getTodayLocalDateString,
  formatUrduDate,
  getDayDifference,
} from '../utils/dateUtils';
import confetti from 'canvas-confetti';
import { generateWhatsAppReport } from '../utils/reportGenerator';

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
    categories: DEFAULT_CATEGORIES,
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

    // Initialize or preserve categories configuration
    if (!parsed.categories || !Array.isArray(parsed.categories) || parsed.categories.length === 0) {
      parsed.categories = DEFAULT_CATEGORIES;
    }

    // Merge tasks: preserve user custom tasks, edits, and hidden statuses
    if (Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
      parsed.tasks = parsed.tasks.map((existing: any) => {
        const dt = DEFAULT_TASKS.find(x => x.id === existing.id);
        return {
          ...dt,
          ...existing,
        };
      });
    } else {
      parsed.tasks = DEFAULT_TASKS;
    }

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

  // Snapshot the old day based on active tasks
  const activeTasks = oldState.tasks.filter(t => !t.hidden);
  const completedCount = activeTasks.filter(t => t.completed).length;
  const totalCount = activeTasks.length;
  const earnedHasanat = activeTasks
    .filter(t => t.completed)
    .reduce((sum, t) => sum + t.hasanat, 0);

  const status: 'completed' | 'partial' | 'missed' =
    completedCount >= Math.ceil(totalCount * 0.6) ? 'completed' : completedCount > 0 ? 'partial' : 'missed';

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
    reportText: generateWhatsAppReport(oldState),
    tasks: JSON.parse(JSON.stringify(oldState.tasks)),
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
  const [selectedDateOverride, setSelectedDateOverride] = useState<string | null>(null);
  const [recentHasanatPop, setRecentHasanatPop] = useState<{ id: string; amount: number } | null>(null);

  // Selected date defaults to state.todayDate if no past date is selected
  const selectedDate = selectedDateOverride ?? state.todayDate;

  const setSelectedDate = useCallback((date: string) => {
    if (date === state.todayDate) {
      setSelectedDateOverride(null);
    } else {
      setSelectedDateOverride(date);
    }
  }, [state.todayDate]);

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

  // Determine if viewing a past day from history
  const isViewingPastDay = selectedDate !== state.todayDate;

  // Selected Day Record (if viewing a past day)
  const selectedDayRecord = useMemo(() => {
    if (!isViewingPastDay) return null;
    return (state.history || []).find(r => r.date === selectedDate) || null;
  }, [isViewingPastDay, state.history, selectedDate]);

  // Active tasks for the selected date
  const activeTasks: MaamulatTask[] = useMemo(() => {
    if (!isViewingPastDay || !selectedDayRecord) {
      return state.tasks;
    }
    // If the record has stored tasks snapshot, use it
    if (selectedDayRecord.tasks && selectedDayRecord.tasks.length > 0) {
      return selectedDayRecord.tasks;
    }
    // Fallback: use current tasks template
    return state.tasks;
  }, [isViewingPastDay, selectedDayRecord, state.tasks]);

  // Active Takbeer-e-Oola for the selected date
  const activeTakbeerOola = isViewingPastDay && selectedDayRecord
    ? selectedDayRecord.takbeerOola
    : state.takbeerOola;

  // Active Sleep Time
  const activeSleepTime = isViewingPastDay && selectedDayRecord
    ? selectedDayRecord.sleepTime
    : state.sleepTime;

  // Active Wake Time
  const activeWakeTime = isViewingPastDay && selectedDayRecord
    ? selectedDayRecord.wakeTime
    : state.wakeTime;

  // Active Goal Day
  const activeGoalDay = isViewingPastDay && selectedDayRecord
    ? selectedDayRecord.goalDay
    : (state.goalDay ?? 1);

  // Active Goal Max Days
  const activeGoalMaxDays = isViewingPastDay && selectedDayRecord
    ? selectedDayRecord.goalMaxDays
    : (state.goalMaxDays ?? 40);

  // Active Urdu Date
  const activeUrduDate = isViewingPastDay && selectedDayRecord
    ? (selectedDayRecord.urduDate || formatUrduDate(selectedDayRecord.date))
    : formatUrduDate(state.todayDate);

  // Toggle a task (handles both Today and editing any past day in history!)
  const toggleTask = useCallback((taskId: string) => {
    if (!isViewingPastDay) {
      // Normal Today toggle
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
          } catch {}
        }

        return {
          ...prev,
          totalHasanat: Math.max(0, prev.totalHasanat + hasanatDelta),
          tasks: updatedTasks,
        };
      });
    } else {
      // Editing a past day's record!
      saveState(prev => {
        const historyCopy = [...(prev.history || [])];
        const recordIndex = historyCopy.findIndex(r => r.date === selectedDate);
        if (recordIndex === -1) return prev;

        const currentRec = historyCopy[recordIndex];
        const dayTasks: MaamulatTask[] = currentRec.tasks && currentRec.tasks.length > 0
          ? JSON.parse(JSON.stringify(currentRec.tasks))
          : JSON.parse(JSON.stringify(prev.tasks));

        const targetTask = dayTasks.find(t => t.id === taskId);
        if (!targetTask) return prev;

        const isNowCompleted = !targetTask.completed;
        const hasanatDelta = isNowCompleted ? targetTask.hasanat : -targetTask.hasanat;

        if (isNowCompleted) {
          setRecentHasanatPop({ id: taskId, amount: targetTask.hasanat });
          setTimeout(() => setRecentHasanatPop(null), 900);
        }

        targetTask.completed = isNowCompleted;
        targetTask.completedAt = isNowCompleted ? new Date().toISOString() : undefined;

        // Recalculate metrics for that day
        const activeT = dayTasks.filter(t => !t.hidden);
        const completedCount = activeT.filter(t => t.completed).length;
        const totalCount = activeT.length;
        const earnedHasanat = activeT.filter(t => t.completed).reduce((sum, t) => sum + t.hasanat, 0);
        const status: 'completed' | 'partial' | 'missed' =
          completedCount >= Math.ceil(totalCount * 0.6) ? 'completed' : completedCount > 0 ? 'partial' : 'missed';

        // Synthesize state to regenerate updated WhatsApp report text
        const mockState: MaamulatState = {
          ...prev,
          todayDate: currentRec.date,
          goalDay: currentRec.goalDay,
          goalMaxDays: currentRec.goalMaxDays,
          takbeerOola: currentRec.takbeerOola,
          sleepTime: currentRec.sleepTime,
          wakeTime: currentRec.wakeTime,
          tasks: dayTasks,
        };

        const updatedRecord: DayRecord = {
          ...currentRec,
          tasks: dayTasks,
          completedCount,
          totalCount,
          hasanatEarned: earnedHasanat,
          status,
          reportText: generateWhatsAppReport(mockState),
        };

        historyCopy[recordIndex] = updatedRecord;

        return {
          ...prev,
          totalHasanat: Math.max(0, prev.totalHasanat + hasanatDelta),
          history: historyCopy,
        };
      });
    }
  }, [isViewingPastDay, selectedDate, saveState]);

  // Adjust Takbeer-e-Oola counter (0 to 5)
  const adjustTakbeerOola = useCallback((delta: number) => {
    if (!isViewingPastDay) {
      saveState(prev => ({
        ...prev,
        takbeerOola: Math.min(5, Math.max(0, prev.takbeerOola + delta)),
      }));
    } else {
      saveState(prev => {
        const historyCopy = [...(prev.history || [])];
        const recordIndex = historyCopy.findIndex(r => r.date === selectedDate);
        if (recordIndex === -1) return prev;

        const currentRec = historyCopy[recordIndex];
        const newTakbeer = Math.min(5, Math.max(0, currentRec.takbeerOola + delta));

        const mockState: MaamulatState = {
          ...prev,
          todayDate: currentRec.date,
          goalDay: currentRec.goalDay,
          goalMaxDays: currentRec.goalMaxDays,
          takbeerOola: newTakbeer,
          sleepTime: currentRec.sleepTime,
          wakeTime: currentRec.wakeTime,
          tasks: currentRec.tasks || prev.tasks,
        };

        historyCopy[recordIndex] = {
          ...currentRec,
          takbeerOola: newTakbeer,
          reportText: generateWhatsAppReport(mockState),
        };

        return {
          ...prev,
          history: historyCopy,
        };
      });
    }
  }, [isViewingPastDay, selectedDate, saveState]);

  // Sleep time change
  const setSleepTime = useCallback((time: string) => {
    if (!isViewingPastDay) {
      saveState(prev => ({ ...prev, sleepTime: time }));
    } else {
      saveState(prev => {
        const historyCopy = [...(prev.history || [])];
        const recordIndex = historyCopy.findIndex(r => r.date === selectedDate);
        if (recordIndex === -1) return prev;

        const currentRec = historyCopy[recordIndex];
        const mockState: MaamulatState = {
          ...prev,
          todayDate: currentRec.date,
          goalDay: currentRec.goalDay,
          goalMaxDays: currentRec.goalMaxDays,
          takbeerOola: currentRec.takbeerOola,
          sleepTime: time,
          wakeTime: currentRec.wakeTime,
          tasks: currentRec.tasks || prev.tasks,
        };

        historyCopy[recordIndex] = {
          ...currentRec,
          sleepTime: time,
          reportText: generateWhatsAppReport(mockState),
        };

        return {
          ...prev,
          history: historyCopy,
        };
      });
    }
  }, [isViewingPastDay, selectedDate, saveState]);

  // Wake time change
  const setWakeTime = useCallback((time: string) => {
    if (!isViewingPastDay) {
      saveState(prev => ({ ...prev, wakeTime: time }));
    } else {
      saveState(prev => {
        const historyCopy = [...(prev.history || [])];
        const recordIndex = historyCopy.findIndex(r => r.date === selectedDate);
        if (recordIndex === -1) return prev;

        const currentRec = historyCopy[recordIndex];
        const mockState: MaamulatState = {
          ...prev,
          todayDate: currentRec.date,
          goalDay: currentRec.goalDay,
          goalMaxDays: currentRec.goalMaxDays,
          takbeerOola: currentRec.takbeerOola,
          sleepTime: currentRec.sleepTime,
          wakeTime: time,
          tasks: currentRec.tasks || prev.tasks,
        };

        historyCopy[recordIndex] = {
          ...currentRec,
          wakeTime: time,
          reportText: generateWhatsAppReport(mockState),
        };

        return {
          ...prev,
          history: historyCopy,
        };
      });
    }
  }, [isViewingPastDay, selectedDate, saveState]);

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
      const nextState = performRollover(prev, nextDateStr);
      setSelectedDateOverride(null);
      return nextState;
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

  // Update categories and tasks (from customizer screen)
  const updateCategoriesAndTasks = useCallback((newCategories: CategoryConfig[], newTasks: MaamulatTask[]) => {
    saveState(prev => ({
      ...prev,
      categories: newCategories,
      tasks: newTasks,
    }));
  }, [saveState]);

  // Reset categories and tasks to original defaults
  const resetCategoriesAndTasksToDefault = useCallback(() => {
    saveState(prev => ({
      ...prev,
      categories: DEFAULT_CATEGORIES,
      tasks: DEFAULT_TASKS.map(dt => {
        const existing = prev.tasks.find(t => t.id === dt.id);
        return {
          ...dt,
          completed: existing ? existing.completed : false,
          completedAt: existing ? existing.completedAt : undefined,
        };
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

  // Calculated metrics for active viewing date
  const activeNonHiddenTasks = activeTasks.filter(t => !t.hidden);
  const completedTasksCount = activeNonHiddenTasks.filter(t => t.completed).length;
  const totalTasksCount = activeNonHiddenTasks.length;
  const todayEarnedHasanat = activeNonHiddenTasks
    .filter(t => t.completed)
    .reduce((sum, t) => sum + t.hasanat, 0);
  const completionPercentage = totalTasksCount > 0
    ? Math.round((completedTasksCount / totalTasksCount) * 100)
    : 0;

  // Active synthesized state (used for Murrabi WhatsApp reports and preview)
  const activeState: MaamulatState = useMemo(() => {
    return {
      ...state,
      todayDate: selectedDate,
      goalDay: activeGoalDay,
      goalMaxDays: activeGoalMaxDays,
      takbeerOola: activeTakbeerOola,
      sleepTime: activeSleepTime,
      wakeTime: activeWakeTime,
      tasks: activeTasks,
    };
  }, [
    state,
    selectedDate,
    activeGoalDay,
    activeGoalMaxDays,
    activeTakbeerOola,
    activeSleepTime,
    activeWakeTime,
    activeTasks,
  ]);

  return {
    state,
    selectedDate,
    setSelectedDate,
    isViewingPastDay,
    activeDate: selectedDate,
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
    setChillaDay: setGoalCurrentDay, // alias
    setMurrabiContact,
    simulateNextDay,
    resetToday,
  };
}
