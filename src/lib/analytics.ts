import { UserStats, UserProfile, ActivityFeedItem, Duel, WeeklyGoal } from "@/types";
import { calculateLevel } from "@/lib/xp-engine";

export interface ProductivityInsight {
  score: number;
  label: string;
  color: string;
  recommendation: string;
  recommendationIcon: string;
  trend: "up" | "down" | "stable";
  trendValue: string;
}

export interface DailyRecommendation {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  icon: string;
}

export function calculateProductivityScore(
  profile: UserProfile | null,
  stats: UserStats | null,
  recentActivity: ActivityFeedItem[],
  activeDuels: Duel[]
): ProductivityInsight {
  if (!profile || !stats) {
    return {
      score: 0,
      label: "NO DATA",
      color: "#6b7280",
      recommendation: "Complete your first task to start tracking productivity.",
      recommendationIcon: "Target",
      trend: "stable",
      trendValue: "—",
    };
  }

  const level = calculateLevel(profile.totalXP);
  const tasksCompleted = stats.tasksCompleted ?? 0;
  const tasksFailed = stats.tasksFailed ?? 0;
  const streak = stats.currentStreak ?? 0;
  const longestStreak = stats.longestStreak ?? 0;
  const duelsWon = stats.duelsWon ?? 0;
  const focusHours = stats.focusHours ?? 0;

  // Component scores (0-100 each)
  const completionRate = tasksCompleted + tasksFailed > 0
    ? Math.round((tasksCompleted / (tasksCompleted + tasksFailed)) * 100)
    : 50;

  const streakScore = Math.min(100, Math.round((streak / Math.max(longestStreak, 7)) * 100));

  const duelScore = Math.min(100, duelsWon * 15);

  const focusScore = Math.min(100, Math.round(focusHours * 5));

  const activityScore = recentActivity.length > 0
    ? Math.min(100, recentActivity.length * 8)
    : 0;

  // Weighted composite
  const score = Math.round(
    completionRate * 0.30 +
    streakScore * 0.25 +
    duelScore * 0.15 +
    focusScore * 0.15 +
    activityScore * 0.15
  );

  const clampedScore = Math.max(0, Math.min(100, score));

  // Label + Color
  let label: string;
  let color: string;
  if (clampedScore >= 80) { label = "ELITE"; color = "#10b981"; }
  else if (clampedScore >= 60) { label = "STRONG"; color = "#00d4ff"; }
  else if (clampedScore >= 40) { label = "MODERATE"; color = "#f59e0b"; }
  else if (clampedScore >= 20) { label = "LOW"; color = "#f97316"; }
  else { label = "CRITICAL"; color = "#ef4444"; }

  // Trend (compare streak to longest)
  let trend: "up" | "down" | "stable" = "stable";
  let trendValue = "—";
  if (streak > longestStreak * 0.8 && streak > 0) {
    trend = "up";
    trendValue = `+${streak}d streak`;
  } else if (tasksFailed > tasksCompleted * 0.3 && tasksFailed > 0) {
    trend = "down";
    trendValue = `${tasksFailed} failed`;
  } else if (tasksCompleted > 0) {
    trend = "up";
    trendValue = `${tasksCompleted} done`;
  }

  // Recommendation
  let recommendation: string;
  let recommendationIcon: string;
  if (streak < 3 && tasksCompleted > 0) {
    recommendation = "Maintain your streak. Complete at least 1 task today.";
    recommendationIcon = "Flame";
  } else if (tasksFailed > tasksCompleted * 0.2) {
    recommendation = "Set realistic deadlines to reduce task failures.";
    recommendationIcon = "Clock";
  } else if (activeDuels.length === 0 && level > 2) {
    recommendation = "Challenge a friend to a duel for bonus XP.";
    recommendationIcon = "Swords";
  } else if (focusHours < 5) {
    recommendation = "Use Focus Mode for deeper concentration sessions.";
    recommendationIcon = "Timer";
  } else {
    recommendation = "You're performing well. Keep pushing for the next rank.";
    recommendationIcon = "TrendingUp";
  }

  return { score: clampedScore, label, color, recommendation, recommendationIcon, trend, trendValue };
}

export function getDailyRecommendation(
  insight: ProductivityInsight,
  profile: UserProfile | null,
  stats: UserStats | null
): DailyRecommendation {
  const level = profile ? calculateLevel(profile.totalXP) : 1;
  const streak = stats?.currentStreak ?? 0;

  if (insight.score < 20) {
    return {
      title: "Recovery Mode",
      description: "Your productivity has dropped. Start with one easy task to rebuild momentum.",
      priority: "high",
      icon: "AlertTriangle",
    };
  }

  if (streak === 0) {
    return {
      title: "Start Your Streak",
      description: "Begin a new daily streak. Complete any task to activate your streak counter.",
      priority: "high",
      icon: "Flame",
    };
  }

  if (streak >= 7 && streak < 14) {
    return {
      title: "Week Warrior",
      description: "7-day streak unlocked. Push to 14 days for a major XP bonus.",
      priority: "medium",
      icon: "Trophy",
    };
  }

  if (streak >= 14) {
    return {
      title: "Unstoppable",
      description: "14+ day streak. You're in the elite zone. Maintain this pace to dominate the leaderboard.",
      priority: "low",
      icon: "Crown",
    };
  }

  if (level < 5) {
    return {
      title: "Level Up Grind",
      description: "Focus on medium-difficulty tasks for optimal XP-per-hour ratio.",
      priority: "medium",
      icon: "Zap",
    };
  }

  return {
    title: "Daily Check-in",
    description: `Day ${streak} streak active. Stay consistent to maintain your ${insight.label} status.`,
    priority: "low",
    icon: "Target",
  };
}

export function calculateGoalProgress(goal: WeeklyGoal): {
  percentage: number;
  completedTasks: number;
  totalTasks: number;
  tasksDone: number;
  tasksTotal: number;
} {
  if (!goal.tasks || goal.tasks.length === 0) {
    return { percentage: 0, completedTasks: 0, totalTasks: 0, tasksDone: 0, tasksTotal: 0 };
  }
  const completedTasks = goal.tasks.filter((t) => t.completed).length;
  const totalTarget = goal.tasks.reduce((s, t) => s + t.targetCount, 0);
  const currentTotal = goal.tasks.reduce(
    (s, t) => s + Math.min(t.currentCount, t.targetCount),
    0
  );
  return {
    percentage: totalTarget > 0 ? Math.round((currentTotal / totalTarget) * 100) : 0,
    completedTasks,
    totalTasks: goal.tasks.length,
    tasksDone: currentTotal,
    tasksTotal: totalTarget,
  };
}
