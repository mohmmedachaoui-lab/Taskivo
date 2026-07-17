import { Task } from "@/types";

const XP_MIN_WIN = 50;
const XP_MAX_WIN = 300;
const XP_MIN_PENALTY = 75;
const XP_MAX_PENALTY = 500;

const WIN_RATE = 0.08;
const PENALTY_RATE = 0.15;

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
