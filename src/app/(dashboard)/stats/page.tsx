"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import LevelRing from "@/components/gamification/LevelRing";
import { useAppStore } from "@/store";
import { calculateLevel, calculateXPProgress, getRankTitle } from "@/lib/xp-engine";
import {
  TrendingUp,
  Flame,
  CheckCircle,
  Zap,
  Target,
  Clock,
  Activity,
} from "lucide-react";

function EmptyChart({ title }: { title: string }) {
  return (
    <Card>
      <h3 className="mb-4 text-xs font-semibold text-gray-400 font-[family-name:var(--font-mono)] uppercase tracking-widest">
        {title}
      </h3>
      <div className="flex flex-col items-center justify-center py-12">
        <Activity className="h-6 w-6 text-gray-700 mb-2" />
        <p className="text-xs text-gray-600 font-[family-name:var(--font-mono)]">NO DATA YET</p>
      </div>
    </Card>
  );
}

export default function StatsPage() {
  const { profile, stats } = useAppStore();
  const level = profile ? calculateLevel(profile.totalXP) : 1;
  const xpProgress = profile ? calculateXPProgress(profile.totalXP) : 0;
  const rank = getRankTitle(level);

  const metrics = [
    { icon: <CheckCircle className="h-4 w-4" />, label: "TASKS DONE", value: stats?.tasksCompleted ?? 0, color: "text-emerald-400" },
    { icon: <Flame className="h-4 w-4" />, label: "BEST STREAK", value: `${stats?.longestStreak ?? 0}d`, color: "text-orange-400" },
    { icon: <Zap className="h-4 w-4" />, label: "TOTAL XP", value: (profile?.totalXP ?? 0).toLocaleString(), color: "text-[#00d4ff]" },
    { icon: <Target className="h-4 w-4" />, label: "SUCCESS RATE", value: stats && stats.tasksCompleted + stats.tasksFailed > 0 ? `${Math.round((stats.tasksCompleted / (stats.tasksCompleted + stats.tasksFailed)) * 100)}%` : "0%", color: "text-[#00d4ff]" },
    { icon: <Clock className="h-4 w-4" />, label: "FOCUS HOURS", value: "0h", color: "text-emerald-400" },
    { icon: <TrendingUp className="h-4 w-4" />, label: "RANK", value: rank, color: "text-yellow-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-mono)] tracking-tight">
          <span className="text-[#00d4ff]">&gt;</span> Analytics
        </h1>
        <p className="text-gray-500 mt-0.5 text-xs font-[family-name:var(--font-mono)] uppercase tracking-widest">
          Track your performance
        </p>
      </div>

      <div className="flex justify-center">
        <LevelRing level={level} xpProgress={xpProgress} xpMax={500} size={130} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="text-center">
              <div className={`inline-flex p-1.5 rounded-lg bg-white/[0.03] ${m.color} mb-2`}>
                {m.icon}
              </div>
              <p className="text-lg font-bold text-white font-[family-name:var(--font-mono)]">{m.value}</p>
              <p className="text-[9px] text-gray-600 font-[family-name:var(--font-mono)] uppercase tracking-widest">{m.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <EmptyChart title="Neuro Score Trend" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <EmptyChart title="Productivity Hours" />
        </motion.div>
      </div>
    </div>
  );
}
