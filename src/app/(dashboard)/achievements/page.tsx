"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import { Trophy, Lock, Zap, Flame, Brain, Swords } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store";
import { ACHIEVEMENTS_DEFINITIONS } from "@/lib/xp-engine";

const CATEGORIES = ["All", "Tasks", "Streaks", "Progression", "Duels", "Focus", "Special"] as const;
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  All: <Trophy className="h-4 w-4" />,
  Tasks: <Zap className="h-4 w-4" />,
  Streaks: <Flame className="h-4 w-4" />,
  Progression: <Trophy className="h-4 w-4" />,
  Duels: <Swords className="h-4 w-4" />,
  Focus: <Brain className="h-4 w-4" />,
  Special: <Trophy className="h-4 w-4" />,
};

export default function AchievementsPage() {
  const { stats, profile } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const unlocked = stats?.achievements ?? [];
  const tasksCompleted = stats?.tasksCompleted ?? 0;
  const currentStreak = stats?.currentStreak ?? 0;
  const level = profile?.level ?? 1;
  const totalXP = profile?.totalXP ?? 0;
  const duelsWon = (stats as any)?.duelsWon ?? 0;

  const getProgress = (type: string, requirement: number): number => {
    switch (type) {
      case "tasks_completed": return Math.min(100, (tasksCompleted / requirement) * 100);
      case "streak": return Math.min(100, (currentStreak / requirement) * 100);
      case "level": return Math.min(100, (level / requirement) * 100);
      case "xp": return Math.min(100, (totalXP / requirement) * 100);
      case "duels_won": return Math.min(100, (duelsWon / requirement) * 100);
      case "focus_sessions": return Math.min(100, (((stats as any)?.focusSessions ?? 0) / requirement) * 100);
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
      case "focus_sessions": return (stats as any)?.focusSessions ?? 0;
      default: return 0;
    }
  };

  const filtered = activeCategory === "All"
    ? ACHIEVEMENTS_DEFINITIONS
    : ACHIEVEMENTS_DEFINITIONS.filter((a) => a.category === activeCategory);

  const totalUnlocked = unlocked.length;
  const totalAchievements = ACHIEVEMENTS_DEFINITIONS.length;
  const completionPercent = Math.round((totalUnlocked / totalAchievements) * 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-400" />
          Achievements
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {totalUnlocked} / {totalAchievements} unlocked — {completionPercent}% complete
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Overall Progress</span>
          <span className="text-sm font-medium text-[#00d4ff]">{completionPercent}%</span>
        </div>
        <div className="h-3 rounded-full bg-gray-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-[#00d4ff] to-blue-500 rounded-full"
          />
        </div>
      </Card>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30"
                : "bg-gray-800/50 text-gray-500 border border-transparent hover:text-gray-300"
            }`}
          >
            {CATEGORY_ICONS[cat]}
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ach, i) => {
          const isUnlocked = unlocked.includes(ach.id);
          const progress = getProgress(ach.type, ach.requirement);
          const current = getCurrentValue(ach.type);

          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card
                hover
                className={`relative overflow-hidden ${
                  isUnlocked
                    ? "border-yellow-500/30 bg-yellow-500/5"
                    : "opacity-80"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`text-3xl ${isUnlocked ? "" : "grayscale opacity-50"}`}>
                    {ach.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {ach.name}
                      </h3>
                      {isUnlocked && <Trophy className="h-3.5 w-3.5 text-yellow-400" />}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {ach.description}
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-600">
                          {current.toLocaleString()} / {ach.requirement.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-600">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
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
                    <Lock className="h-4 w-4 text-gray-600 mt-1" />
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
