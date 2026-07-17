"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import LevelRing from "@/components/gamification/LevelRing";
import { useAppStore } from "@/store";
import { calculateLevel, calculateXPProgress, getRankTitle } from "@/lib/xp-engine";
import {
  BarChart3,
  TrendingUp,
  Flame,
  CheckCircle,
  Zap,
  Target,
  Clock,
  Activity,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-blue-500">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

function EmptyChart({ title }: { title: string }) {
  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <div className="flex flex-col items-center justify-center py-12">
        <Activity className="h-10 w-10 text-gray-300 dark:text-gray-700 mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No data yet</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Start completing tasks to see trends
        </p>
      </div>
    </Card>
  );
}

export default function StatsPage() {
  const { profile, stats } = useAppStore();
  const level = profile ? calculateLevel(profile.totalXP) : 1;
  const xpProgress = profile ? calculateXPProgress(profile.totalXP) : 0;
  const rank = getRankTitle(level);

  const hasChartData = false;

  const metrics = [
    {
      icon: <CheckCircle className="h-5 w-5" />,
      label: "Tasks Done",
      value: stats?.tasksCompleted ?? 0,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      icon: <Flame className="h-5 w-5" />,
      label: "Best Streak",
      value: `${stats?.longestStreak ?? 0} days`,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      label: "Total XP",
      value: profile?.totalXP ?? 0,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: <Target className="h-5 w-5" />,
      label: "Success Rate",
      value:
        stats && stats.tasksCompleted + stats.tasksFailed > 0
          ? `${Math.round(
              (stats.tasksCompleted /
                (stats.tasksCompleted + stats.tasksFailed)) *
                100
            )}%`
          : "0%",
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: "Focus Hours",
      value: "0h",
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: "Level",
      value: `${level} — ${rank}`,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-blue-500" />
          Stats & Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your performance and growth
        </p>
      </div>

      <div className="flex justify-center">
        <LevelRing level={level} xpProgress={xpProgress} xpMax={500} size={140} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="text-center">
              <div className={`inline-flex p-2 rounded-xl ${m.bg} ${m.color} mb-2`}>
                {m.icon}
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {m.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{m.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {hasChartData ? (
            <Card>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Neuro Score Trend
              </h3>
            </Card>
          ) : (
            <EmptyChart title="Neuro Score Trend" />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {hasChartData ? (
            <Card>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Productivity Hours
              </h3>
            </Card>
          ) : (
            <EmptyChart title="Productivity Hours" />
          )}
        </motion.div>
      </div>
    </div>
  );
}
