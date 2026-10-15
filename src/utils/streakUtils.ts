import type { DayRecord, MaamulatTask } from '../types';
import { getYesterdayLocalDateString, getDayDifference } from './dateUtils';
import {
  STREAK_PASS_PERCENTAGE,
  STREAK_PASS_RATIO,
  PASS_THRESHOLD_RATIO,
  getStreakPassTarget,
  isCompletionQualified,
} from '../constants/streakConstants';

export {
  STREAK_PASS_PERCENTAGE,
  STREAK_PASS_RATIO,
  PASS_THRESHOLD_RATIO,
  getStreakPassTarget,
  isCompletionQualified,
};

/**
 * Determines if a day record meets the criteria to pass / count toward the streak.
 */
export function isDayQualified(record: {
  completedCount: number;
  totalCount: number;
  status?: 'completed' | 'partial' | 'missed';
}): boolean {
  if (record.status === 'completed') return true;
  return isCompletionQualified(record.completedCount, record.totalCount);
}

export interface StreakDetails {
  currentStreak: number;
  highestStreak: number;
  isTodayQualified: boolean;
  consecutivePastDays: number;
  todayCompletedCount: number;
  todayTotalCount: number;
  passTargetCount: number;
  neededForToday: number;
}

/**
 * Dynamically calculates the accurate current streak and all-time highest streak
 * from actual history records and today's active progress.
 */
export function calculateStreakDetails(
  history: DayRecord[],
  currentTasks: MaamulatTask[],
  todayDate: string,
  storedHighest: number = 0
): StreakDetails {
  // 1. Calculate Today's status
  const activeToday = (currentTasks || []).filter(t => !t.hidden);
  const todayTotalCount = activeToday.length;
  const todayCompletedCount = activeToday.filter(t => t.completed).length;
  const passTargetCount = Math.ceil(todayTotalCount * PASS_THRESHOLD_RATIO);
  const isTodayQualified = todayTotalCount > 0 && todayCompletedCount >= passTargetCount;
  const neededForToday = Math.max(0, passTargetCount - todayCompletedCount);

  // 2. Map history by date for fast O(1) consecutive lookup
  const historyByDate = new Map<string, DayRecord>();
  for (const rec of (history || [])) {
    if (rec && rec.date) {
      historyByDate.set(rec.date, rec);
    }
  }

  // 3. Trace backwards day-by-day from yesterday to find consecutive passed days
  let consecutivePastDays = 0;
  let checkDate = getYesterdayLocalDateString(todayDate);

  while (true) {
    const rec = historyByDate.get(checkDate);
    if (!rec) {
      break; // Gap in recording or day not logged
    }
    if (!isDayQualified(rec)) {
      break; // Day was not fully qualified (e.g. partial or missed)
    }
    consecutivePastDays += 1;
    checkDate = getYesterdayLocalDateString(checkDate);
  }

  // Current streak = consecutive past days + (1 if today is already qualified)
  const currentStreak = isTodayQualified ? consecutivePastDays + 1 : consecutivePastDays;

  // 4. Calculate highest historical streak across all recorded history
  const sortedRecords = Array.from(historyByDate.values())
    .sort((a, b) => a.date.localeCompare(b.date));

  let maxHistorical = 0;
  let currentRun = 0;
  let prevDate: string | null = null;

  for (const rec of sortedRecords) {
    if (isDayQualified(rec)) {
      if (prevDate && getDayDifference(rec.date, prevDate) === 1) {
        currentRun += 1;
      } else {
        currentRun = 1;
      }
      if (currentRun > maxHistorical) {
        maxHistorical = currentRun;
      }
    } else {
      currentRun = 0;
    }
    prevDate = rec.date;
  }

  const highestStreak = Math.max(storedHighest, maxHistorical, currentStreak);

  return {
    currentStreak,
    highestStreak,
    isTodayQualified,
    consecutivePastDays,
    todayCompletedCount,
    todayTotalCount,
    passTargetCount,
    neededForToday,
  };
}
