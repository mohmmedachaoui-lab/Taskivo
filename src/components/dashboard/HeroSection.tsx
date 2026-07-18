"use client";

import { useAppStore } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { calculateLevel, calculateXPProgress, getRankTitle } from "@/lib/xp-engine";
import { calculateProductivityScore, getDailyRecommendation } from "@/lib/analytics";
import LevelRing from "@/components/gamification/LevelRing";
import { motion } from "framer-motion";
import { Flame, Zap, Trophy, Swords, Clock, TrendingUp, AlertTriangle, Target, Crown, Timer } from "lucide-react";
import { useRealtimeDuels } from "@/hooks/useRealtimeDuels";
import { useRealtimeFeed } from "@/hooks/useRealtimeFeed";
import { useFriends } from "@/hooks/useFriends";

const ICON_MAP: Record<string, typeof Zap> = {
  Flame, Clock, Swords, Timer, TrendingUp, AlertTriangle, Target, Crown, Trophy, Zap,
};

export default function HeroSection() {
  const { user } = useAuth();
  const { profile, stats } = useAppStore();
  const { friendUids } = useFriends(user?.uid);
  const { activeDuels } = useRealtimeDuels(user?.uid);
  const { feed } = useRealtimeFeed(user?.uid, friendUids);

  const level = profile ? calculateLevel(profile.totalXP) : 1;
  const xpProgress = profile ? calculateXPProgress(profile.totalXP) : 0;
  const rank = getRankTitle(level);
  const streak = stats?.currentStreak ?? 0;
  const tasksDone = stats?.tasksCompleted ?? 0;

  const insight = calculateProductivityScore(profile, stats, feed, activeDuels);
  const recommendation = getDailyRecommendation(insight, profile, stats);
  const RecIcon = ICON_MAP[recommendation.icon] || Target;

  return (
    <div className="h-full flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 70% 20%, rgba(0, 212, 255, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 30% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 50%),
            linear-gradient(135deg, rgba(0, 212, 255, 0.03), transparent 60%)
          `,
        }}
      />

      <div className="relative z-10">
        {/* Top row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-[family-name:var(--font-mono)] text-[#00d4ff]/80 uppercase tracking-[0.3em] px-2 py-0.5 rounded-full border border-[#00d4ff]/20 bg-[#00d4ff]/5">
              {rank}
            </span>
            <span className="text-[10px] font-[family-name:var(--font-mono)] text-gray-600 uppercase tracking-[0.2em]">
              LVL {level}
            </span>
          </div>
          {insight.score > 0 && (
            <span
              className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full"
              style={{
                color: insight.color,
                background: `${insight.color}10`,
                border: `1px solid ${insight.color}25`,
              }}
            >
              {insight.label} · {insight.score}
            </span>
          )}
        </div>

        {/* Name */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1">
          {profile?.callsign ?? "Agent"}
        </h1>
        <p className="text-xs text-gray-500 mb-4">
          {tasksDone > 0
            ? `${tasksDone} tasks completed${streak > 0 ? ` · ${streak}d streak` : ""}`
            : "Start your first task to begin your mission."}
        </p>
      </div>

      {/* Daily Recommendation */}
      {insight.score > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 flex items-center gap-3 px-3.5 py-2.5 rounded-xl mb-4"
          style={{
            background: "rgba(10, 15, 25, 0.7)",
            border: "1px solid rgba(255, 255, 255, 0.04)",
          }}
        >
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${insight.color}12` }}
          >
            <RecIcon className="h-4 w-4" style={{ color: insight.color }} strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold font-[family-name:var(--font-mono)] uppercase tracking-wider" style={{ color: insight.color }}>
              {recommendation.title}
            </p>
            <p className="text-[11px] text-gray-500 truncate">{recommendation.description}</p>
          </div>
        </motion.div>
      )}

      {/* Level ring — bottom right */}
      <div className="relative z-10 flex justify-end">
        <LevelRing level={level} xpProgress={xpProgress} xpMax={500} size={80} />
      </div>
    </div>
  );
}
