const MS_PER_DAY = 86_400_000;

export function getLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / MS_PER_DAY);
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  streakJustReset: boolean;
}

export function calculateStreakUpdate(
  currentStreak: number,
  longestStreak: number,
  lastActiveDate: string | null,
  streakPaused: boolean,
  today: string = getLocalDateString()
): StreakResult {
  if (!lastActiveDate) {
    const newStreak = 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(longestStreak, newStreak),
      lastActiveDate: today,
      streakJustReset: false,
    };
  }

  if (lastActiveDate === today) {
    return {
      currentStreak,
      longestStreak,
      lastActiveDate: today,
      streakJustReset: false,
    };
  }

  const gap = daysBetween(lastActiveDate, today);

  if (gap === 1) {
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(longestStreak, newStreak),
      lastActiveDate: today,
      streakJustReset: false,
    };
  }

  if (streakPaused) {
    return {
      currentStreak,
      longestStreak,
      lastActiveDate: today,
      streakJustReset: false,
    };
  }

  return {
    currentStreak: 1,
    longestStreak,
    lastActiveDate: today,
    streakJustReset: currentStreak > 0,
  };
}

const FREEZE_LIMIT_PER_WEEK = 1;

export function getFreezeResetDate(lastActiveDate: string | null): string | null {
  if (!lastActiveDate) return null;
  const d = new Date(lastActiveDate + "T00:00:00");
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - d.getDay());
  return getLocalDateString(weekStart);
}

export function canUseFreeze(
  streakFreezesUsed: number
): boolean {
  return streakFreezesUsed < FREEZE_LIMIT_PER_WEEK;
}

export function getFreezesRemaining(streakFreezesUsed: number): number {
  return Math.max(0, FREEZE_LIMIT_PER_WEEK - streakFreezesUsed);
}

export function shouldResetFreezes(
  streakFreezesUsed: number,
  lastActiveDate: string | null,
  today: string = getLocalDateString()
): boolean {
  if (streakFreezesUsed === 0) return false;
  if (!lastActiveDate) return false;
  const lastWeekStart = getFreezeResetDate(lastActiveDate);
  const thisWeekStart = getFreezeResetDate(today);
  return lastWeekStart !== thisWeekStart;
}
