"use client";

import { useAppStore } from "@/store";
import { calculateXPProgress, getRankTitle, calculateLevel } from "@/lib/xp-engine";
import Card from "@/components/ui/Card";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Flame,
  TrendingUp,
  Zap,
  Target,
} from "lucide-react";

export default function DashboardPage() {
  const { profile, stats } = useAppStore();

  const level = profile ? calculateLevel(profile.totalXP) : 1;
  const xpProgress = profile ? calculateXPProgress(profile.totalXP) : 0;
  const xpPercent = (xpProgress / 500) * 100;
  const rank = getRankTitle(level);

  const statCards = [
    {
      label: "Tasks Completed",
      value: stats?.tasksCompleted ?? 0,
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Tasks Failed",
      value: stats?.tasksFailed ?? 0,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
    {
      label: "Current Streak",
      value: `${stats?.currentStreak ?? 0} days`,
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      label: "Longest Streak",
      value: `${stats?.longestStreak ?? 0} days`,
      icon: TrendingUp,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {profile?.callsign ?? "Agent"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Here&apos;s your productivity overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <Card>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Level Progress
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Level {level} &middot; {rank}
                </p>
              </div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Zap className="h-5 w-5" />
                <span className="font-semibold">{profile?.totalXP ?? 0} XP</span>
              </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {xpProgress} / 500 XP to next level
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Target className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Stats
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Success Rate
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {stats && stats.tasksCompleted + stats.tasksFailed > 0
                    ? Math.round(
                        (stats.tasksCompleted /
                          (stats.tasksCompleted + stats.tasksFailed)) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total Tasks
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {(stats?.tasksCompleted ?? 0) + (stats?.tasksFailed ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Guild
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {stats?.guildId ?? "None"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Achievements
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {stats?.achievements?.length ?? 0}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Productivity Calendar
          </h2>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400"
              >
                {i + 1}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
            Calendar data will populate as you complete tasks
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
