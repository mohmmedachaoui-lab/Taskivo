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
  focusHours: number;
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
  memberCount: number;
  totalXP: number;
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

export interface Duel {
  id: string;
  challengerId: string;
  challengerName: string;
  challengerXP: number;
  opponentId: string;
  opponentName: string;
  opponentXP: number;
  status: "pending" | "active" | "completed" | "expired";
  winnerId: string | null;
  startTime: number | null;
  endTime: number;
  createdAt: number;
}

export interface FriendRequest {
  id: string;
  fromUid: string;
  fromCallsign: string;
  fromPhoto: string | null;
  toUid: string;
  status: "pending" | "accepted" | "declined";
  createdAt: number;
}

export interface Friendship {
  id: string;
  uid1: string;
  uid2: string;
  createdAt: number;
}

export interface Notification {
  id: string;
  uid: string;
  type: "duel_request" | "duel_won" | "duel_lost" | "friend_request" | "friend_accepted" | "guild_invite";
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
  data?: Record<string, any>;
}

export type Theme = "light" | "dark";
