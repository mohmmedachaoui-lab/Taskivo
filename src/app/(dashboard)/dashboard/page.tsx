"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import {
  calculateXPProgress,
  getRankTitle,
  calculateLevel,
} from "@/lib/xp-engine";
import { getFriends, getActivityFeed } from "@/lib/social";
import SummaryCard from "@/components/ui/SummaryCard";
import LevelRing from "@/components/gamification/LevelRing";
import WeeklyActivity from "@/components/dashboard/WeeklyActivity";
import Card from "@/components/ui/Card";
import { useDeepMode } from "@/components/ui/DeepMode";
import { motion } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  Flame,
  Zap,
  Swords,
  Trophy,
  TrendingUp,
  Activity,
  Eye,
} from "lucide-react";
import { ActivityFeedItem } from "@/types";

const FEED_ICONS: Record<string, React.ReactNode> = {
  task_completed: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
  duel_won: <Trophy className="h-3.5 w-3.5 text-yellow-400" />,
  duel_lost: <Swords className="h-3.5 w-3.5 text-red-400" />,
  level_up: <TrendingUp className="h-3.5 w-3.5 text-[#00d4ff]" />,
  achievement: <Trophy className="h-3.5 w-3.5 text-yellow-400" />,
  streak: <Flame className="h-3.5 w-3.5 text-orange-400" />,
  guild_join: <Activity className="h-3.5 w-3.5 text-blue-400" />,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { profile, stats } = useAppStore();
  const { isDeep, toggleDeep } = useDeepMode();
  const [feed, setFeed] = useState<ActivityFeedItem[]>([]);

  const level = profile ? calculateLevel(profile.totalXP) : 1;
  const xpProgress = profile ? calculateXPProgress(profile.totalXP) : 0;
  const rank = getRankTitle(level);

  const tasksDone = stats?.tasksCompleted ?? 0;
  const dayStreak = stats?.currentStreak ?? 0;
  const totalXP = profile?.totalXP ?? 0;
  const xpLost = (stats as any)?.xpLost ?? 0;

  const loadFeed = useCallback(async () => {
    if (!user) return;
    try {
      const friends = await getFriends(user.uid);
      const items = await getActivityFeed(friends, user.uid);
      setFeed(items);
    } catch (err) {
      console.error("Failed to load feed:", err);
    }
  }, [user]);

  useEffect(() => {
    loadFeed();
    const interval = setInterval(loadFeed, 15000);
    return () => clearInterval(interval);
  }, [loadFeed]);

  const getRelativeTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-mono)] tracking-tight">
            <span className="text-[#00d4ff]">&gt;</span> {profile?.callsign ?? "Agent"}
          </h1>
          <p className="text-gray-500 mt-0.5 text-xs font-[family-name:var(--font-mono)] uppercase tracking-widest">
            {rank} · LEVEL {level}
          </p>
        </div>
        <button
          onClick={toggleDeep}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-[family-name:var(--font-mono)] uppercase tracking-wider transition-all duration-300 ${
            isDeep
              ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/40 glow-neon"
              : "bg-white/[0.03] text-gray-500 border border-gray-800 hover:border-gray-700"
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          Deep Mode
        </button>
      </div>

      {/* Stats Grid — Asymmetrical */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <SummaryCard
            title="Neuro"
            value={0}
            icon={<Brain className="h-4 w-4" />}
            color="from-cyan-400 to-blue-500"
            glow="shadow-cyan-400/20"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <SummaryCard
            title="Tasks"
            value={tasksDone}
            icon={<CheckCircle2 className="h-4 w-4" />}
            color="from-emerald-500 to-green-600"
            glow="shadow-emerald-500/20"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SummaryCard
            title="Streak"
            value={`${dayStreak}d`}
            icon={<Flame className="h-4 w-4" />}
            color="from-orange-500 to-red-500"
            glow="shadow-orange-500/20"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <SummaryCard
            title="XP"
            value={totalXP.toLocaleString()}
            icon={<Zap className="h-4 w-4" />}
            color="from-[#00d4ff] to-blue-600"
            glow="shadow-[#00d4ff]/20"
            penalty={xpLost > 0 ? xpLost : undefined}
          />
        </motion.div>
      </div>

      {/* Main Content — Asymmetrical 3-column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart — 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 deep-dim"
        >
          <WeeklyActivity />
        </motion.div>

        {/* Level Ring — 1 col */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="deep-vibrant"
        >
          <div className="glass neon-border rounded-xl p-6 h-full flex flex-col items-center justify-center corner-accent">
            <LevelRing level={level} xpProgress={xpProgress} xpMax={500} size={130} />
            <p className="mt-3 text-[10px] text-gray-500 font-[family-name:var(--font-mono)] uppercase tracking-widest">
              {xpProgress} / 500 XP
            </p>
            <p className="text-[10px] text-[#00d4ff]/60 font-[family-name:var(--font-mono)] mt-0.5">
              {rank}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="deep-dim"
      >
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-[#00d4ff]" />
            <h3 className="text-xs font-semibold text-gray-400 font-[family-name:var(--font-mono)] uppercase tracking-widest">
              Live Feed
            </h3>
            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
          </div>
          {feed.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-6 w-6 text-gray-700 mx-auto mb-2" />
              <p className="text-xs text-gray-600 font-[family-name:var(--font-mono)]">NO DATA STREAM</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {feed.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.02] transition-colors"
                >
                  {FEED_ICONS[item.type] || <Activity className="h-3.5 w-3.5 text-gray-600" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-400 truncate">
                      <span className="text-white font-medium">{item.callsign}</span>{" "}
                      {item.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.xpChange !== 0 && (
                      <span className={`text-[10px] font-[family-name:var(--font-mono)] font-medium ${item.xpChange > 0 ? "text-[#00d4ff]" : "text-red-400"}`}>
                        {item.xpChange > 0 ? "+" : ""}{item.xpChange}
                      </span>
                    )}
                    <span className="text-[9px] text-gray-700 font-[family-name:var(--font-mono)]">
                      {getRelativeTime(item.createdAt)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
