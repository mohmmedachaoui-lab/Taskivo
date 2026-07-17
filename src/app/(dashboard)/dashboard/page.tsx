"use client";

import { useAppStore } from "@/store";
import {
  calculateXPProgress,
  getRankTitle,
  calculateLevel,
} from "@/lib/xp-engine";
import SummaryCard from "@/components/ui/SummaryCard";
import LevelRing from "@/components/gamification/LevelRing";
import WeeklyActivity from "@/components/dashboard/WeeklyActivity";
import { motion } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  Flame,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const { profile, stats } = useAppStore();

  const level = profile ? calculateLevel(profile.totalXP) : 1;
  const xpProgress = profile ? calculateXPProgress(profile.totalXP) : 0;
  const rank = getRankTitle(level);

  const tasksDone = stats?.tasksCompleted ?? 0;
  const dayStreak = stats?.currentStreak ?? 0;
  const totalXP = profile?.totalXP ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {profile?.callsign ?? "Agent"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {rank} &middot; Level {level}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <SummaryCard
            title="Neuro Score"
            value={0}
            icon={<Brain className="h-5 w-5" />}
            color="from-purple-500 to-indigo-600"
            glow="shadow-purple-500/20"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SummaryCard
            title="Tasks Done"
            value={tasksDone}
            icon={<CheckCircle2 className="h-5 w-5" />}
            color="from-green-500 to-emerald-600"
            glow="shadow-green-500/20"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SummaryCard
            title="Day Streak"
            value={`${dayStreak}d`}
            icon={<Flame className="h-5 w-5" />}
            color="from-orange-500 to-red-500"
            glow="shadow-orange-500/20"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SummaryCard
            title="Total XP"
            value={totalXP.toLocaleString()}
            icon={<Zap className="h-5 w-5" />}
            color="from-blue-500 to-cyan-500"
            glow="shadow-blue-500/20"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <WeeklyActivity />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 flex flex-col items-center justify-center h-full">
            <LevelRing
              level={level}
              xpProgress={xpProgress}
              xpMax={500}
              size={140}
            />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {xpProgress} / 500 XP to next level
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {rank}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
