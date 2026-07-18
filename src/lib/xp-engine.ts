import { Task } from "@/types";

const XP_MIN_WIN = 50;
const XP_MAX_WIN = 300;
const XP_MIN_PENALTY = 75;
const XP_MAX_PENALTY = 500;

const WIN_RATE = 0.08;
const PENALTY_RATE = 0.15;
const MISSED_TASK_PENALTY_RATE = 0.10;
const MISSED_TASK_MIN_PENALTY = 25;
const MISSED_TASK_MAX_PENALTY = 200;

export function calculateXP(
  difficulty: Task["difficulty"],
  currentLevel: number
): { xp: number; isPenalty: boolean } {
  return {
    xp: 0,
    isPenalty: false,
  };
}

export function calculateWinXP(
  difficulty: Task["difficulty"],
  currentLevel: number
): number {
  const baseXP = getBaseXP(difficulty);
  const scaledXP = baseXP + currentLevel * 5;
  const percentageBonus = Math.round(scaledXP * WIN_RATE);
  const totalXP = scaledXP + percentageBonus;
  return Math.max(XP_MIN_WIN, Math.min(XP_MAX_WIN, totalXP));
}

export function calculatePenaltyXP(
  difficulty: Task["difficulty"],
  currentLevel: number
): number {
  const baseXP = getBaseXP(difficulty);
  const scaledXP = baseXP + currentLevel * 5;
  const percentageDeduction = Math.round(scaledXP * PENALTY_RATE);
  const totalDeduction = scaledXP + percentageDeduction;
  return Math.max(XP_MIN_PENALTY, Math.min(XP_MAX_PENALTY, totalDeduction));
}

export function calculateMissedTaskPenalty(
  difficulty: Task["difficulty"],
  currentLevel: number
): number {
  const baseXP = getBaseXP(difficulty);
  const scaledXP = baseXP + currentLevel * 3;
  const penalty = Math.round(scaledXP * MISSED_TASK_PENALTY_RATE);
  return Math.max(MISSED_TASK_MIN_PENALTY, Math.min(MISSED_TASK_MAX_PENALTY, penalty));
}

export function calculateDuelStake(
  currentXP: number,
  stakeMultiplier: number = 0.05
): number {
  const stake = Math.round(currentXP * stakeMultiplier);
  return Math.max(50, Math.min(500, stake));
}

function getBaseXP(difficulty: Task["difficulty"]): number {
  switch (difficulty) {
    case "easy":
      return 100;
    case "medium":
      return 175;
    case "hard":
      return 250;
    case "extreme":
      return 375;
  }
}

export function calculateLevel(totalXP: number): number {
  const xpPerLevel = 500;
  return Math.floor(totalXP / xpPerLevel) + 1;
}

export function calculateXPProgress(totalXP: number): number {
  const xpPerLevel = 500;
  return totalXP % xpPerLevel;
}

export function getRankTitle(level: number): string {
  if (level >= 50) return "Legendary";
  if (level >= 40) return "Master";
  if (level >= 30) return "Champion";
  if (level >= 20) return "Veteran";
  if (level >= 15) return "Expert";
  if (level >= 10) return "Skilled";
  if (level >= 5) return "Apprentice";
  return "Novice";
}

export const ACHIEVEMENTS_DEFINITIONS = [
  { id: "first_task", name: "First Steps", description: "Complete your first task", icon: "🎯", requirement: 1, type: "tasks_completed" as const, category: "Tasks" },
  { id: "ten_tasks", name: "Getting Started", description: "Complete 10 tasks", icon: "🔥", requirement: 10, type: "tasks_completed" as const, category: "Tasks" },
  { id: "fifty_tasks", name: "Half Century", description: "Complete 50 tasks", icon: "⚡", requirement: 50, type: "tasks_completed" as const, category: "Tasks" },
  { id: "hundred_tasks", name: "Century", description: "Complete 100 tasks", icon: "💎", requirement: 100, type: "tasks_completed" as const, category: "Tasks" },
  { id: "streak_3", name: "On Fire", description: "3-day streak", icon: "🔥", requirement: 3, type: "streak" as const, category: "Streaks" },
  { id: "streak_7", name: "Week Warrior", description: "7-day streak", icon: "⚔️", requirement: 7, type: "streak" as const, category: "Streaks" },
  { id: "streak_30", name: "Unstoppable", description: "30-day streak", icon: "👑", requirement: 30, type: "streak" as const, category: "Streaks" },
  { id: "level_5", name: "Rising Star", description: "Reach level 5", icon: "⭐", requirement: 5, type: "level" as const, category: "Progression" },
  { id: "level_10", name: "Veteran", description: "Reach level 10", icon: "🏆", requirement: 10, type: "level" as const, category: "Progression" },
  { id: "level_25", name: "Elite", description: "Reach level 25", icon: "🌟", requirement: 25, type: "level" as const, category: "Progression" },
  { id: "level_50", name: "Legendary", description: "Reach level 50", icon: "🏅", requirement: 50, type: "level" as const, category: "Progression" },
  { id: "xp_1000", name: "XP Hunter", description: "Earn 1000 XP", icon: "💰", requirement: 1000, type: "xp" as const, category: "Progression" },
  { id: "xp_5000", name: "XP Legend", description: "Earn 5000 XP", icon: "🏅", requirement: 5000, type: "xp" as const, category: "Progression" },
  { id: "duel_win_1", name: "Duel Novice", description: "Win your first duel", icon: "⚔️", requirement: 1, type: "duels_won" as const, category: "Duels" },
  { id: "duel_win_5", name: "Duel Warrior", description: "Win 5 duels", icon: "🗡️", requirement: 5, type: "duels_won" as const, category: "Duels" },
  { id: "duel_win_15", name: "Duel Legend", description: "Win 15 duels", icon: "🏆", requirement: 15, type: "duels_won" as const, category: "Duels" },
  { id: "focus_10", name: "Deep Work Master", description: "Complete 10 focus sessions", icon: "🧠", requirement: 10, type: "focus_sessions" as const, category: "Focus" },
  { id: "focus_50", name: "Zen Master", description: "Complete 50 focus sessions", icon: "🧘", requirement: 50, type: "focus_sessions" as const, category: "Focus" },
  { id: "early_bird", name: "Early Bird", description: "Complete a task before 8 AM", icon: "🐦", requirement: 1, type: "tasks_completed" as const, category: "Special" },
] as const;
