/**
 * Streak and Habit Acceptance Configuration
 * 
 * Central configuration for daily task acceptance and streak qualification.
 * Modify these values to adjust requirements across the entire application.
 */

/**
 * The acceptance percentage required to pass a day (e.g. 60 for 60%).
 */
export const STREAK_PASS_PERCENTAGE = 60;

/**
 * Ratio representation of the acceptance percentage (0.60).
 */
export const STREAK_PASS_RATIO = STREAK_PASS_PERCENTAGE / 100;

/**
 * Alias for backwards-compatibility.
 */
export const PASS_THRESHOLD_RATIO = STREAK_PASS_RATIO;

/**
 * Calculates the minimum number of completed tasks required to qualify a day
 * based on the active task count and the acceptance percentage.
 */
export function getStreakPassTarget(totalCount: number): number {
  if (totalCount <= 0) return 0;
  return Math.ceil(totalCount * STREAK_PASS_RATIO);
}

/**
 * Checks whether a given completed count meets the qualification threshold.
 */
export function isCompletionQualified(completedCount: number, totalCount: number): boolean {
  if (totalCount <= 0) return false;
  return completedCount >= getStreakPassTarget(totalCount);
}
