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
import { motion } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  Flame,
  Zap,
  AlertTriangle,
  Swords,
  Trophy,
  TrendingUp,
  Activity,
} from "lucide-react";
import { ActivityFeedItem } from "@/types";

const FEED_ICONS: Record<string, React.ReactNode> = {
  task_completed: <CheckCircle2 className="h-4 w-4 text-green-400" />,
  duel_won: <Trophy className="h-4 w-4 text-yellow-400" />,
  duel_lost: <Swords className="h-4 w-4 text-red-400" />,
  level_up: <TrendingUp className="h-4 w-4 text-[#00d4ff]" />,
  achievement: <Trophy className="h-4 w-4 text-yellow-400" />,
  streak: <Flame className="h-4 w-4 text-orange-400" />,
  guild_join: <Activity className="h-4 w-4 text-blue-400" />,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { profile, stats } = useAppStore();
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
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

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
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <SummaryCard
            title="Neuro Score"
            value={0}
            icon={<Brain className="h-5 w-5" />}
            color="from-cyan-400 to-cyan-500"
            glow="shadow-cyan-400/20"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SummaryCard
            title="Tasks Done"
            value={tasksDone}
            icon={<CheckCircle2 className="h-5 w-5" />}
            color="from-green-500 to-emerald-600"
            glow="shadow-green-500/20"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SummaryCard
            title="Day Streak"
            value={`${dayStreak}d`}
            icon={<Flame className="h-5 w-5" />}
            color="from-orange-500 to-red-500"
            glow="shadow-orange-500/20"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <SummaryCard
            title="Total XP"
            value={totalXP.toLocaleString()}
            icon={<Zap className="h-5 w-5" />}
            color="from-blue-500 to-cyan-500"
            glow="shadow-blue-500/20"
            penalty={xpLost > 0 ? xpLost : undefined}
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
          <div className="rounded-2xl border border-gray-800/60 bg-gray-900/80 p-6 flex flex-col items-center justify-center h-full">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-[#00d4ff]" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Activity Feed
            </h3>
          </div>
          {feed.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No activity yet</p>
              <p className="text-xs text-gray-600 mt-1">Add friends to see their activity here</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {feed.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {FEED_ICONS[item.type] || <Activity className="h-4 w-4 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate">
                      <span className="font-medium text-white">{item.callsign}</span>{" "}
                      {item.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.xpChange !== 0 && (
                      <span className={`text-xs font-medium ${item.xpChange > 0 ? "text-[#00d4ff]" : "text-red-400"}`}>
                        {item.xpChange > 0 ? "+" : ""}{item.xpChange} XP
                      </span>
                    )}
                    <span className="text-[10px] text-gray-600">
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
