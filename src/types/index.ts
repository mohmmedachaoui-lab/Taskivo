export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  callsign: string;
  friendCode: string; // e.g. "Agent#4821" — immutable once set
  friendSuffix: number; // 4-digit suffix
  rank: string;
  level: number;
  totalXP: number;
  createdAt: number;
  onboardingComplete: boolean;
  overrideUnlocked?: boolean;
  fcmTokens?: string[];
  notificationSettings?: NotificationSettings;
}

export interface UserStats {
  uid: string;
  tasksCompleted: number;
  tasksFailed: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  streakPaused: boolean;
  streakFreezesUsed: number;
  totalXP: number;
  level: number;
  guildId: string | null;
  achievements: string[];
  focusHours: number;
  xpLost: number;
  duelsWon: number;
  focusSessions: number;
  earlyBirdTasks: number;
}

export interface Task {
  id: string;
  uid: string;
  title: string;
  difficulty: "easy" | "medium" | "hard" | "extreme";
  completed: boolean;
  penalty: boolean;
  deadline: number | null;
  createdAt: number;
  completedAt: number | null;
  xpAwarded: number;
  urgent?: boolean;
  totalSubtasks: number;
  completedSubtasks: number;
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

export interface GuildMember {
  uid: string;
  callsign: string;
  role: "owner" | "officer" | "member";
  joinedAt: number;
}

export interface GuildNews {
  id: string;
  guildId: string;
  message: string;
  type: "join" | "leave" | "kick" | "promote" | "achievement" | "milestone";
  createdAt: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: "tasks_completed" | "streak" | "level" | "xp" | "duels_won" | "focus_sessions";
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
  stakeXP: number;
  challengerSettled?: boolean;
  opponentSettled?: boolean;
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
  type: "duel_request" | "duel_won" | "duel_lost" | "friend_request" | "friend_accepted" | "guild_invite" | "achievement_unlocked" | "xp_penalty" | "stake_won" | "stake_lost";
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
  data?: Record<string, unknown>;
}

export interface ActivityFeedItem {
  id: string;
  uid: string;
  callsign: string;
  type: "task_completed" | "duel_won" | "duel_lost" | "achievement" | "level_up" | "streak" | "guild_join";
  message: string;
  xpChange: number;
  createdAt: number;
}

export type Theme = "light" | "dark";

export interface WeeklyGoalTask {
  id: string;
  title: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
}

export interface WeeklyGoal {
  id: string;
  uid: string;
  title: string;
  weekStart: number;
  weekEnd: number;
  tasks: WeeklyGoalTask[];
  completed: boolean;
  createdAt: number;
}

export interface CompanionNudge {
  id: string;
  type: "encouragement" | "break_reminder" | "focus_tip" | "milestone" | "streak_protection";
  message: string;
  icon: string;
  priority: "low" | "medium" | "high";
  dismissed: boolean;
  createdAt: number;
}

export interface CompanionState {
  active: boolean;
  currentSessionStart: number | null;
  nudges: CompanionNudge[];
  sessionsToday: number;
  totalFocusMinutes: number;
}

// ========== FRIEND ID / CALLSIGN ==========

export interface FriendCode {
  friendCode: string; // e.g. "Agent#4821"
  friendSuffix: number; // 4-digit suffix
}

// ========== CONVERSATIONS / MESSAGING ==========

export interface Conversation {
  id: string;
  type: "direct" | "group";
  members: string[];
  memberCallsigns: Record<string, string>;
  lastMessage: string;
  lastMessageAt: number;
  lastMessageUid: string;
  createdBy: string;
  groupName?: string;
  groupIcon?: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  senderUid: string;
  senderCallsign: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface TypingDoc {
  isTyping: boolean;
  updatedAt: number;
}

// ========== FRIEND PROFILE (for mini profile card) ==========

export interface FriendProfile {
  uid: string;
  callsign: string;
  friendCode: string;
  photoURL: string | null;
  level: number;
  totalXP: number;
  tasksCompleted: number;
  duelsWon: number;
  achievements: string[];
  currentStreak: number;
  online?: boolean;
}

// ========== CHAT STORE STATE ==========

export interface ChatState {
  activeConversationId: string | null;
  showDrawer: boolean;
  unreadCount: number;
  setActiveConversation: (id: string | null) => void;
  toggleDrawer: () => void;
  setUnreadCount: (count: number) => void;
}

// ========== NOTIFICATION SETTINGS ==========

export interface NotificationSettings {
  friendRequests: boolean;
  messages: boolean;
  duels: boolean;
  achievements: boolean;
}
