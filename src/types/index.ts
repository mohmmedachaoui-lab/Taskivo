export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  callsign: string;
  rank: string;
  level: number;
  totalXP: number;
  createdAt: number;
  onboardingComplete: boolean;
}

export interface UserStats {
  uid: string;
  tasksCompleted: number;
  tasksFailed: number;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  level: number;
  guildId: string | null;
  achievements: string[];
}

export interface Task {
  id: string;
  uid: string;
  title: string;
  difficulty: "easy" | "medium" | "hard" | "extreme";
  completed: boolean;
  penalty: boolean;
  createdAt: number;
  completedAt: number | null;
  xpAwarded: number;
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[];
  createdAt: number;
  icon: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: "tasks_completed" | "streak" | "level" | "xp";
}

export type Theme = "light" | "dark";
