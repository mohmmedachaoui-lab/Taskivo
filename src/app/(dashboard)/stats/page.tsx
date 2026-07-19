"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import LevelRing from "@/components/gamification/LevelRing";
import { useAppStore } from "@/store";
import { useSkeletonTimeout } from "@/hooks/useSkeletonTimeout";
import { calculateLevel, calculateXPProgress, getRankTitle } from "@/lib/xp-engine";
import {
  TrendingUp,
  Flame,
  CheckCircle,
  Zap,
  Target,
  Clock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

function StatsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-3 w-36 mt-2" />
      </div>

      <div className="flex justify-center">
        <div className="h-[130px] w-[130px] rounded-full shimmer bg-white/[0.03] border border-white/[0.04]" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="text-center">
            <div className="inline-flex p-1.5 rounded-lg bg-white/[0.03] mb-2">
              <div className="h-4 w-4 shimmer rounded" />
            </div>
            <Skeleton className="h-6 w-16 mx-auto mb-1" />
            <Skeleton className="h-2.5 w-20 mx-auto" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <Skeleton className="h-3 w-32 mb-4" />
            <div className="flex items-end gap-1.5 h-20">
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="flex-1 shimmer rounded-t bg-white/[0.03] border border-white/[0.04] border-b-0" style={{ height: `${25 + Math.random() * 45}%` }} />
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {Array.from({ length: 7 }).map((_, j) => (
                <Skeleton key={j} className="h-2 w-3" />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EmptyChart({ title }: { title: string }) {
  return (
    <Card>
      <h3 className="mb-4 text-xs font-semibold text-gray-400 font-[family-name:var(--font-mono)] uppercase tracking-widest">
        {title}
      </h3>
      <div className="space-y-3">
        <div className="flex items-end gap-1.5 h-20">
          {[35, 22, 45, 18, 52, 30, 40].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-white/[0.02] border border-white/[0.03] border-b-0 shimmer" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="flex justify-between">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span key={i} className="text-[9px] text-gray-700 font-[family-name:var(--font-mono)] flex-1 text-center">{d}</span>
          ))}
        </div>
        <div className="flex items-center justify-center pt-2">
          <span className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)] uppercase tracking-widest">
            Awaiting data — complete tasks to populate
          </span>
        </div>
      </div>
    </Card>
  );
}

export default function StatsPage() {
  const profile = useAppStore(s => s.profile);
  const stats = useAppStore(s => s.stats);
  const loading = !profile || !stats;
  const { timedOut, reset } = useSkeletonTimeout(loading);

  if (loading && !timedOut) return <StatsSkeleton />;
  if (loading && timedOut) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-10 w-10 text-yellow-500 mb-3" />
        <p className="text-sm text-gray-400 mb-1">Failed to load stats</p>
        <p className="text-xs text-gray-600 mb-4">Data couldn't be loaded. Check your connection and try again.</p>
        <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-gray-400 hover:text-white transition-colors">
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      </div>
    );
  }
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
