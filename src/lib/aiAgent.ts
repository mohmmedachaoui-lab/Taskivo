import { Task, UserStats, ActivityFeedItem } from "@/types";
import { calculateLevel, calculateXPProgress } from "@/lib/xp-engine";

const XP_PER_LEVEL = 500;

// ========== TYPES ==========

export interface AgentInsight {
  id: string;
  type: "nudge" | "task_order" | "rank_prediction" | "pattern";
  priority: number; // higher = shown first
  icon: string;
  title: string;
  message: string;
  accent?: string;
}

export interface SuggestedTask {
  task: Task;
  reason: string;
  score: number;
}

export interface AgentAnalysis {
  insights: AgentInsight[];
  suggestedOrder: SuggestedTask[];
  peakHour: number | null;
  avgXPPerDay: number;
  daysToNextLevel: number | null;
  xpToNextLevel: number;
  levelProgress: number;
}

// ========== ANALYSIS ENGINE ==========

export function analyzeAgentData(
  tasks: Task[],
  stats: UserStats | null,
  totalXP: number,
  feed: ActivityFeedItem[]
): AgentAnalysis {
  const now = Date.now();
  const todayStart = getStartOfDay(now);

  const completedTasks = tasks.filter((t) => t.completed && t.completedAt);
  const pendingTasks = tasks.filter((t) => !t.completed && !t.penalty);

  const peakHour = computePeakHour(completedTasks);
  const avgXPPerDay = computeAvgXPPerDay(feed, now);
  const level = calculateLevel(totalXP);
  const xpToNextLevel = level * XP_PER_LEVEL - totalXP;
  const levelProgress = calculateXPProgress(totalXP);
  const daysToNextLevel = avgXPPerDay > 0 ? Math.ceil(xpToNextLevel / avgXPPerDay) : null;

  const insights = computeInsights(
    stats,
    totalXP,
    level,
    levelProgress,
    xpToNextLevel,
    daysToNextLevel,
    pendingTasks,
    completedTasks,
    feed,
    todayStart,
    now,
    peakHour
  );

  const suggestedOrder = rankPendingTasks(pendingTasks, peakHour, now);

  return {
    insights: insights.sort((a, b) => b.priority - a.priority),
    suggestedOrder,
    peakHour,
    avgXPPerDay,
    daysToNextLevel,
    xpToNextLevel,
    levelProgress,
  };
}

// ========== PEAK HOUR ==========

function computePeakHour(completedTasks: Task[]): number | null {
  const hourCounts = new Array(24).fill(0);
  let hasData = false;

  for (const task of completedTasks) {
    if (task.completedAt) {
      const hour = new Date(task.completedAt).getHours();
      hourCounts[hour]++;
      hasData = true;
    }
  }

  if (!hasData) return null;

  let maxCount = 0;
  let peakH = 12;
  for (let h = 0; h < 24; h++) {
    if (hourCounts[h] > maxCount) {
      maxCount = hourCounts[h];
      peakH = h;
    }
  }
  return peakH;
}

// ========== AVG XP PER DAY ==========

function computeAvgXPPerDay(feed: ActivityFeedItem[], now: number): number {
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  let totalXPWeek = 0;
  let dayCount = 7;

  for (const item of feed) {
    if (item.createdAt >= sevenDaysAgo && item.xpChange > 0) {
      totalXPWeek += item.xpChange;
    }
  }

  // If no activity in feed, fall back to account age estimation
  if (totalXPWeek === 0) return 0;

  // Count actual active days in the window for a more accurate average
  const activeDays = new Set(
    feed
      .filter((item) => item.createdAt >= sevenDaysAgo && item.xpChange > 0)
      .map((item) => new Date(item.createdAt).toDateString())
  ).size;

  dayCount = Math.max(activeDays, 1);
  return Math.round(totalXPWeek / dayCount);
}

// ========== INSIGHTS ==========

function computeInsights(
  stats: UserStats | null,
  totalXP: number,
  level: number,
  levelProgress: number,
  xpToNextLevel: number,
  daysToNextLevel: number | null,
  pendingTasks: Task[],
  completedTasks: Task[],
  feed: ActivityFeedItem[],
  todayStart: number,
  now: number,
  peakHour: number | null
): AgentInsight[] {
  const insights: AgentInsight[] = [];

  // --- Streak at risk (highest priority if applicable) ---
  const hasActivityToday = feed.some(
    (item) => item.createdAt >= todayStart && item.xpChange > 0
  );
  const streak = stats?.currentStreak ?? 0;
  if (!hasActivityToday && streak > 0) {
    insights.push({
      id: "streak_risk",
      type: "nudge",
      priority: 100,
      icon: "\u26a0\ufe0f",
      title: "Streak at Risk",
      message: streak >= 7
        ? `Your ${streak}-day streak ends today. Complete a task to keep it alive.`
        : `Your ${streak}-day streak will reset if you don't complete a task today.`,
      accent: "#f97316",
    });
  }

  // --- Level progress ---
  if (levelProgress >= 80) {
    insights.push({
      id: "level_close",
      type: "rank_prediction",
      priority: 90,
      icon: "\ud83c\udfaf",
      title: "Level Up imminent",
      message: `${Math.round(levelProgress)}% to level ${level + 1}. Just ${xpToNextLevel} XP away.`,
      accent: "#00d4ff",
    });
  } else if (levelProgress >= 40) {
    const daysText = daysToNextLevel !== null
      ? ` (~${daysToNextLevel} day${daysToNextLevel !== 1 ? "s" : ""} at current pace)`
      : "";
    insights.push({
      id: "level_progress",
      type: "rank_prediction",
      priority: 60,
      icon: "\u2b50",
      title: "Level Progress",
      message: `${Math.round(levelProgress)}% toward level ${level + 1}${daysText}.`,
      accent: "#00d4ff",
    });
  }

  // --- Pending task count ---
  if (pendingTasks.length > 0) {
    const deadlineUrgent = pendingTasks.filter(
      (t) => t.deadline && t.deadline - now < 24 * 60 * 60 * 1000 && t.deadline > now
    ).length;
    if (deadlineUrgent > 0) {
      insights.push({
        id: "deadline_urgent",
        type: "nudge",
        priority: 85,
        icon: "\u23f0",
        title: "Deadline Approaching",
        message: `${deadlineUrgent} task${deadlineUrgent > 1 ? "s" : ""} due within 24 hours.`,
        accent: "#ef4444",
      });
    } else {
      insights.push({
        id: "pending_tasks",
        type: "nudge",
        priority: 40,
        icon: "\ud83d\udcdd",
        title: "Missions Pending",
        message: `${pendingTasks.length} active task${pendingTasks.length > 1 ? "s" : ""} in your queue.`,
        accent: "#facc15",
      });
    }
  }

  // --- Morning pattern ---
  if (peakHour !== null && peakHour < 12 && (stats?.earlyBirdTasks ?? 0) >= 2) {
    insights.push({
      id: "morning_pattern",
      type: "pattern",
      priority: 50,
      icon: "\ud83c\udf05",
      title: "Morning Pattern Detected",
      message: `You tend to complete tasks before noon. Try scheduling difficult work in the morning.`,
      accent: "#f59e0b",
    });
  } else if (peakHour !== null && peakHour >= 18) {
    insights.push({
      id: "evening_pattern",
      type: "pattern",
      priority: 50,
      icon: "\ud83c\udf19",
      title: "Night Owl Mode",
      message: `Your peak productivity is around ${formatHour(peakHour)}. Leverage those evening hours.`,
      accent: "#a855f7",
    });
  }

  // --- Focus session nudge ---
  const focusSessions = stats?.focusSessions ?? 0;
  if (focusSessions === 0 && completedTasks.length >= 3) {
    insights.push({
      id: "try_focus",
      type: "nudge",
      priority: 30,
      icon: "\u23f1\ufe0f",
      title: "Try Focus Mode",
      message: "You haven't tried Focus Mode yet. 25-minute sessions earn bonus XP.",
      accent: "#00d4ff",
    });
  }

  // --- Completion rate ---
  const totalAttempted = (stats?.tasksCompleted ?? 0) + (stats?.tasksFailed ?? 0);
  if (totalAttempted >= 10) {
    const rate = Math.round(((stats?.tasksCompleted ?? 0) / totalAttempted) * 100);
    if (rate >= 90) {
      insights.push({
        id: "high_completion",
        type: "pattern",
        priority: 35,
        icon: "\ud83d\udcaa",
        title: "Strong Completion Rate",
        message: `${rate}% task completion rate. You finish what you start.`,
        accent: "#10b981",
      });
    }
  }

  // --- XP efficiency ---
  const avgXP = totalAttempted > 0 ? Math.round(totalXP / totalAttempted) : 0;
  if (avgXP > 0 && totalAttempted >= 5) {
    insights.push({
      id: "xp_efficiency",
      type: "pattern",
      priority: 20,
      icon: "\u26a1",
      title: "XP Efficiency",
      message: `Averaging ${avgXP} XP per completed task across ${totalAttempted} tasks.`,
      accent: "#3b82f6",
    });
  }

  // Ensure at least one insight
  if (insights.length === 0) {
    insights.push({
      id: "getting_started",
      type: "nudge",
      priority: 50,
      icon: "\ud83d\ude80",
      title: "Agent Online",
      message: "Complete a few tasks and I'll start detecting patterns in your workflow.",
      accent: "#ec4899",
    });
  }

  return insights;
}

// ========== TASK ORDERING ==========

/**
 * Strategy: Easiest-first for momentum.
 *
 * Why: The user is in a gamified system (XP, levels, streaks). Completing easy
 * tasks first creates quick dopamine hits and builds momentum. It also clears
 * cognitive overhead, making hard tasks feel less overwhelming. Deadline urgency
 * is layered on top — a task due today outranks an easy task due next week.
 *
 * Scoring formula (0-100 scale):
 *   score = urgency_score * 0.6 + difficulty_score * 0.3 + xp_score * 0.1
 *
 * - urgency_score: 100 if due < 6h, 80 if < 24h, 60 if < 72h, 30 if has deadline, 10 if none
 * - difficulty_score: easy=100, medium=70, hard=40, extreme=15 (easier = higher = done first)
 * - xp_score: normalized xpAwarded (higher XP tasks get slight priority for efficiency)
 */
function rankPendingTasks(
  pendingTasks: Task[],
  peakHour: number | null,
  now: number
): SuggestedTask[] {
  const maxXP = Math.max(...pendingTasks.map((t) => t.xpAwarded), 1);

  return pendingTasks
    .map((task) => {
      const urgencyScore = computeUrgencyScore(task, now);
      const difficultyScore = computeDifficultyScore(task.difficulty);
      const xpScore = (task.xpAwarded / maxXP) * 100;
      const score = urgencyScore * 0.6 + difficultyScore * 0.3 + xpScore * 0.1;

      const reason = buildTaskReason(task, urgencyScore, peakHour);

      return { task, reason, score: Math.round(score) };
    })
    .sort((a, b) => b.score - a.score);
}

function computeUrgencyScore(task: Task, now: number): number {
  if (!task.deadline) return 10;
  const hoursLeft = (task.deadline - now) / (60 * 60 * 1000);
  if (hoursLeft < 0) return 100; // overdue
  if (hoursLeft < 6) return 100;
  if (hoursLeft < 24) return 80;
  if (hoursLeft < 72) return 60;
  return 30;
}

function computeDifficultyScore(difficulty: Task["difficulty"]): number {
  switch (difficulty) {
    case "easy": return 100;
    case "medium": return 70;
    case "hard": return 40;
    case "extreme": return 15;
  }
}

function buildTaskReason(
  task: Task,
  urgencyScore: number,
  peakHour: number | null
): string {
  if (urgencyScore >= 100 && task.deadline) {
    const hoursLeft = Math.max(0, (task.deadline - Date.now()) / (60 * 60 * 1000));
    if (hoursLeft < 1) return "Due very soon";
    if (hoursLeft < 6) return `Due in ${Math.ceil(hoursLeft)}h`;
    return "Deadline approaching";
  }
  if (task.difficulty === "easy") return "Quick win to build momentum";
  if (task.difficulty === "extreme") return "High XP reward — tackle with focus";
  const currentHour = new Date().getHours();
  if (peakHour !== null && Math.abs(currentHour - peakHour) <= 2) {
    return `${capitalize(task.difficulty)} — you\u2019re in your peak window`;
  }
  return `${capitalize(task.difficulty)} difficulty`;
}

// ========== HELPERS ==========

function getStartOfDay(timestamp: number): number {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
