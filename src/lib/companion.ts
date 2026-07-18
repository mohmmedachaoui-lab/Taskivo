import { CompanionNudge, CompanionState, UserStats, UserProfile } from "@/types";
import { calculateLevel } from "@/lib/xp-engine";

const NUDGE_COOLDOWN_MS = 30 * 60 * 1000;

const NUDGE_TEMPLATES: Record<string, { messages: string[]; icons: string[] }> = {
  encouragement: {
    messages: [
      "You're building something great. Keep pushing forward.",
      "Every completed task compounds. Stay consistent.",
      "Momentum is your weapon. Don't lose it now.",
      "Your future self will thank you for today's effort.",
    ],
    icons: ["💪", "🔥", "⚡", "🚀"],
  },
  break_reminder: {
    messages: [
      "You've been focused for a while. A 5-minute break prevents burnout.",
      "Micro-rests boost performance. Step away for a moment.",
      "Your brain needs a reset. Take a short walk.",
    ],
    icons: ["☕", "🧘", "🌿"],
  },
  focus_tip: {
    messages: [
      "Try the Pomodoro technique: 25 min work, 5 min break.",
      "Batch similar tasks together to reduce context switching.",
      "Hardest task first — your willpower peaks at the start.",
      "Close all unnecessary tabs. Distraction is the enemy.",
    ],
    icons: ["🎯", "🧠", "💡", "📋"],
  },
  milestone: {
    messages: [
      "Milestone reached! You're proving your discipline.",
      "Another checkpoint cleared. The next level is within reach.",
    ],
    icons: ["🏆", "🎖️", "⭐"],
  },
  streak_protection: {
    messages: [
      "Your streak is active. Complete one task to protect it.",
      "Don't let your streak die today — you've come too far.",
    ],
    icons: ["🔥", "🛡️", "⏰"],
  },
};

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createNudge(
  type: CompanionNudge["type"],
  message?: string,
  icon?: string,
  priority: CompanionNudge["priority"] = "medium"
): CompanionNudge {
  const template = NUDGE_TEMPLATES[type];
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    message: message || randomPick(template.messages),
    icon: icon || randomPick(template.icons),
    priority,
    dismissed: false,
    createdAt: Date.now(),
  };
}

export function generateNudges(
  profile: UserProfile | null,
  stats: UserStats | null,
  companion: CompanionState,
  sessionMinutes: number
): CompanionNudge[] {
  if (!profile || !stats) return [];

  const nudges: CompanionNudge[] = [];
  const level = calculateLevel(profile.totalXP);
  const streak = stats.currentStreak ?? 0;
  const sessionsToday = companion.sessionsToday;
  const lastNudge = companion.nudges[0];

  if (lastNudge && Date.now() - lastNudge.createdAt < NUDGE_COOLDOWN_MS) {
    return [];
  }

  if (streak > 0 && streak < 3) {
    nudges.push(createNudge("streak_protection", undefined, undefined, "high"));
  } else if (sessionMinutes >= 25 && sessionMinutes < 50) {
    nudges.push(createNudge("break_reminder", undefined, undefined, "medium"));
  } else if (sessionMinutes >= 50) {
    nudges.push(
      createNudge(
        "encouragement",
        "Impressive focus session. Take a well-earned break.",
        "🔥",
        "high"
      )
    );
  }

  if (sessionsToday === 0 && companion.active) {
    nudges.push(createNudge("focus_tip", undefined, undefined, "low"));
  }

  if (sessionsToday >= 4) {
    nudges.push(
      createNudge(
        "milestone",
        `${sessionsToday} focus sessions today. You're operating at elite level.`,
        "🏆",
        "medium"
      )
    );
  }

  if (level < 5 && sessionsToday >= 2) {
    nudges.push(
      createNudge(
        "encouragement",
        "Consistent sessions are the fastest path to leveling up.",
        "⚡",
        "low"
      )
    );
  }

  if (nudges.length === 0) {
    const types: CompanionNudge["type"][] = ["encouragement", "focus_tip"];
    nudges.push(createNudge(randomPick(types), undefined, undefined, "low"));
  }

  return nudges;
}

export function getCompanionStatus(
  stats: UserStats | null,
  companion: CompanionState
): {
  mood: "focused" | "resting" | "motivating" | "celebrating";
  label: string;
  color: string;
} {
  if (!stats) return { mood: "focused", label: "Ready", color: "#6b7280" };

  if (companion.sessionsToday >= 5) {
    return { mood: "celebrating", label: "Elite Focus", color: "#10b981" };
  }
  if (companion.active) {
    return { mood: "focused", label: "In Session", color: "#00d4ff" };
  }
  if (companion.totalFocusMinutes > 0 && companion.sessionsToday > 0) {
    return { mood: "resting", label: "Resting", color: "#f59e0b" };
  }
  return { mood: "motivating", label: "Ready", color: "#a855f7" };
}

export const INITIAL_COMPANION_STATE: CompanionState = {
  active: false,
  currentSessionStart: null,
  nudges: [],
  sessionsToday: 0,
  totalFocusMinutes: 0,
};
