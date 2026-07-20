"use client";

import { memo } from "react";
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

export default memo(function HeroSection() {
  const { user } = useAuth();
  const profile = useAppStore(s => s.profile);
  const stats = useAppStore(s => s.stats);
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
      {/* Background gradient orbs */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 80% 15%, rgba(0, 212, 255, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 85%, rgba(168, 85, 247, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 60%, rgba(59, 130, 246, 0.03) 0%, transparent 40%)
          `,
        }}
      />

      <div className="relative z-10">
        {/* Top row — badges */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="badge badge-info">
              <span className="badge-dot" />
              {rank}
            </span>
            <span className="badge" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#6b7280" }}>
              LVL {level}
            </span>
          </div>
          {insight.score > 0 && (
            <span
              className="badge"
              style={{
                color: insight.color,
                background: `${insight.color}08`,
                border: `1px solid ${insight.color}20`,
              }}
            >
              <span className="badge-dot" style={{ background: insight.color, boxShadow: `0 0 6px ${insight.color}60` }} />
              {insight.label} · {insight.score}
            </span>
          )}
        </div>

        {/* Name — gradient text */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 gradient-text-agent">
          {profile?.callsign ?? "Agent"}
        </h1>
        <p className="text-xs text-gray-500 mb-4 font-[family-name:var(--font-mono)]">
          {tasksDone > 0
            ? `${tasksDone} tasks completed${streak > 0 ? ` · ${streak}d streak` : ""}`
            : "Start your first mission to begin your journey."}
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
            background: "rgba(8, 12, 24, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: `${insight.color}10`,
              border: `1px solid ${insight.color}15`,
              boxShadow: `0 0 10px ${insight.color}08`,
            }}
          >
            <RecIcon
              className="h-4 w-4"
              style={{
                color: insight.color,
                filter: `drop-shadow(0 0 3px ${insight.color}50)`,
              }}
              strokeWidth={2.5}
            />
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
})
