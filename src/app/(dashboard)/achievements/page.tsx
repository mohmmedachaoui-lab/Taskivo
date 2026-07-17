"use client";

import Card from "@/components/ui/Card";
import { Trophy, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store";

const ACHIEVEMENTS = [
  { id: "first_task", name: "First Steps", description: "Complete your first task", icon: "🎯", requirement: 1, type: "tasks_completed" },
  { id: "ten_tasks", name: "Getting Started", description: "Complete 10 tasks", icon: "🔥", requirement: 10, type: "tasks_completed" },
  { id: "fifty_tasks", name: "Half Century", description: "Complete 50 tasks", icon: "⚡", requirement: 50, type: "tasks_completed" },
  { id: "hundred_tasks", name: "Century", description: "Complete 100 tasks", icon: "💎", requirement: 100, type: "tasks_completed" },
  { id: "streak_3", name: "On Fire", description: "3-day streak", icon: "🔥", requirement: 3, type: "streak" },
  { id: "streak_7", name: "Week Warrior", description: "7-day streak", icon: "⚔️", requirement: 7, type: "streak" },
  { id: "streak_30", name: "Unstoppable", description: "30-day streak", icon: "👑", requirement: 30, type: "streak" },
  { id: "level_5", name: "Rising Star", description: "Reach level 5", icon: "⭐", requirement: 5, type: "level" },
  { id: "level_10", name: "Veteran", description: "Reach level 10", icon: "🏆", requirement: 10, type: "level" },
  { id: "level_25", name: "Elite", description: "Reach level 25", icon: "🌟", requirement: 25, type: "level" },
  { id: "xp_1000", name: "XP Hunter", description: "Earn 1000 XP", icon: "💰", requirement: 1000, type: "xp" },
  { id: "xp_5000", name: "XP Legend", description: "Earn 5000 XP", icon: "🏅", requirement: 5000, type: "xp" },
];

export default function AchievementsPage() {
  const { stats } = useAppStore();
  const unlocked = stats?.achievements ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Achievements
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {unlocked.length} / {ACHIEVEMENTS.length} unlocked
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((ach, i) => {
          const isUnlocked = unlocked.includes(ach.id);
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
                    ? "border-yellow-300 dark:border-yellow-600"
                    : "opacity-60"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{ach.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {ach.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {ach.description}
                    </p>
                  </div>
                  {!isUnlocked && (
                    <Lock className="h-5 w-5 text-gray-400" />
                  )}
                  {isUnlocked && (
                    <Trophy className="h-5 w-5 text-yellow-500" />
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
