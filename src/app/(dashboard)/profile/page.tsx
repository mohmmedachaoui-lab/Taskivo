"use client";

import { useMemo } from "react";
import Image from "next/image";
import Card from "@/components/ui/Card";
import LevelRing from "@/components/gamification/LevelRing";
import { useAppStore } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { calculateLevel, calculateXPProgress, getRankTitle, ACHIEVEMENTS_DEFINITIONS } from "@/lib/xp-engine";
import { motion } from "framer-motion";
import {
  Trophy,
  Zap,
  Flame,
  Swords,
  Brain,
  Target,
  TrendingUp,
  Lock,
  User,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const profile = useAppStore((s) => s.profile);
  const stats = useAppStore((s) => s.stats);

  const level = profile ? calculateLevel(profile.totalXP) : 1;
  const xpProgress = profile ? calculateXPProgress(profile.totalXP) : 0;
  const rank = getRankTitle(level);
  const unlocked = useMemo(() => stats?.achievements ?? [], [stats?.achievements]);

  const tasksCompleted = stats?.tasksCompleted ?? 0;
  const currentStreak = stats?.currentStreak ?? 0;
  const focusSessions = stats?.focusSessions ?? 0;
  const duelsWon = stats?.duelsWon ?? 0;
  const totalXP = profile?.totalXP ?? 0;

  const getProgress = (type: string, requirement: number): number => {
    switch (type) {
      case "tasks_completed": return Math.min(100, (tasksCompleted / requirement) * 100);
      case "streak": return Math.min(100, (currentStreak / requirement) * 100);
      case "level": return Math.min(100, (level / requirement) * 100);
      case "xp": return Math.min(100, (totalXP / requirement) * 100);
      case "duels_won": return Math.min(100, (duelsWon / requirement) * 100);
      case "focus_sessions": return Math.min(100, (focusSessions / requirement) * 100);
      default: return 0;
    }
  };

  const getCurrentValue = (type: string): number => {
    switch (type) {
      case "tasks_completed": return tasksCompleted;
      case "streak": return currentStreak;
      case "level": return level;
      case "xp": return totalXP;
      case "duels_won": return duelsWon;
      case "focus_sessions": return focusSessions;
      default: return 0;
    }
  };

  const totalUnlocked = unlocked.length;
  const totalAchievements = ACHIEVEMENTS_DEFINITIONS.length;
  const completionPercent = Math.round((totalUnlocked / totalAchievements) * 100);

  const statCards = [
    { label: "Total XP", value: totalXP.toLocaleString(), icon: Zap, color: "#3b82f6" },
    { label: "Missions Done", value: tasksCompleted, icon: Target, color: "#facc15" },
    { label: "Current Streak", value: `${currentStreak}d`, icon: Flame, color: "#f97316" },
    { label: "Level", value: level, icon: TrendingUp, color: "#00d4ff" },
    { label: "Duels Won", value: duelsWon, icon: Swords, color: "#ef4444" },
    { label: "Focus Sessions", value: focusSessions, icon: Brain, color: "#a855f7" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-mono)] tracking-tight">
          <span className="text-[#00d4ff]">&gt;</span> Profile
        </h1>
        <p className="text-gray-500 mt-0.5 text-xs font-[family-name:var(--font-mono)] uppercase tracking-widest">
          Your agent profile and achievements
        </p>
      </div>

      {/* Profile Card */}
      <Card className="flex items-center gap-6">
        {user?.photoURL ? (
          <div className="relative">
            <Image
              src={user.photoURL}
              alt={profile?.callsign ?? "User profile photo"}
              width={80}
              height={80}
              className="h-20 w-20 rounded-2xl object-cover ring-2 ring-[#00d4ff]/20"
            />
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#10b981] border-2 border-[#050508]" />
          </div>
        ) : (
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#00d4ff] flex items-center justify-center">
            <User className="h-10 w-10 text-white" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-white truncate">
            {profile?.callsign ?? "Agent"}
          </h2>
          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] font-medium font-[family-name:var(--font-mono)]">
              Level {level}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#00d4ff]/10 text-[#00d4ff] font-medium font-[family-name:var(--font-mono)]">
              {rank}
            </span>
            <span className="text-xs text-gray-500 font-[family-name:var(--font-mono)]">
              {totalXP.toLocaleString()} XP
            </span>
          </div>
        </div>
        <LevelRing level={level} xpProgress={xpProgress} xpMax={500} size={80} />
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="text-center py-4">
              <stat.icon
                className="h-5 w-5 mx-auto mb-2"
                style={{
                  color: stat.color,
                  filter: `drop-shadow(0 0 4px ${stat.color}40)`,
                }}
                strokeWidth={2}
              />
              <p className="text-xl font-bold text-white font-[family-name:var(--font-mono)]">
                {stat.value}
              </p>
              <p className="text-[9px] text-gray-600 font-[family-name:var(--font-mono)] uppercase tracking-widest mt-1">
                {stat.label}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Achievements Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white font-[family-name:var(--font-mono)] tracking-tight flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-400" />
              Achievements
            </h2>
            <p className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)] uppercase tracking-widest mt-0.5">
              {totalUnlocked} / {totalAchievements} — {completionPercent}% complete
            </p>
          </div>
        </div>

        <Card className="overflow-hidden mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Overall Progress</span>
            <span className="text-sm font-medium text-[#00d4ff]">{completionPercent}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#00d4ff] to-blue-500 rounded-full"
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACHIEVEMENTS_DEFINITIONS.map((ach, i) => {
            const isUnlocked = unlocked.includes(ach.id);
            const progress = getProgress(ach.type, ach.requirement);
            const current = getCurrentValue(ach.type);

            return (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <Card
                  hover
                  className={`relative overflow-hidden ${
                    isUnlocked
                      ? "border-yellow-500/20 bg-yellow-500/[0.03]"
                      : "opacity-70"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`text-2xl flex-shrink-0 ${
                        isUnlocked ? "" : "grayscale opacity-50"
                      }`}
                    >
                      {ach.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-white text-xs truncate">
                          {ach.name}
                        </h3>
                        {isUnlocked && (
                          <Trophy className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {ach.description}
                      </p>
                      <div className="mt-1.5">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[9px] text-gray-600 font-[family-name:var(--font-mono)]">
                            {current.toLocaleString()} / {ach.requirement.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-gray-600 font-[family-name:var(--font-mono)]">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <div className="h-1 rounded-full bg-gray-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.6, delay: i * 0.03 }}
                            className={`h-full rounded-full ${
                              isUnlocked
                                ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                                : "bg-gradient-to-r from-[#00d4ff] to-blue-500"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                    {!isUnlocked && (
                      <Lock className="h-3.5 w-3.5 text-gray-600 mt-0.5 flex-shrink-0" />
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
