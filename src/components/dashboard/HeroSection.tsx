"use client";

import { useAppStore } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { calculateLevel, calculateXPProgress, getRankTitle } from "@/lib/xp-engine";
import LevelRing from "@/components/gamification/LevelRing";
import { motion } from "framer-motion";
import { Flame, Zap, Trophy, Swords, ChevronRight } from "lucide-react";

export default function HeroSection() {
  const { user } = useAuth();
  const { profile, stats } = useAppStore();
  const level = profile ? calculateLevel(profile.totalXP) : 1;
  const xpProgress = profile ? calculateXPProgress(profile.totalXP) : 0;
  const rank = getRankTitle(level);
  const streak = stats?.currentStreak ?? 0;
  const tasksDone = stats?.tasksCompleted ?? 0;
  const duelsWon = (stats as any)?.duelsWon ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-[380px] rounded-2xl overflow-hidden mb-2"
      style={{ background: "#000" }}
    >
      {/* Background — abstract neon gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 80% 20%, rgba(0, 212, 255, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 80%, rgba(0, 100, 255, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 50%, rgba(0, 212, 255, 0.04) 0%, transparent 60%),
            #000000
          `,
        }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 212, 255, 0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.6) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Bottom gradient fade */}
      <div className="absolute inset-0 hero-gradient-bottom" />

      {/* Content */}
      <div className="relative h-full flex items-end p-8 pb-10">
        <div className="flex items-end gap-8 w-full">
          {/* Level Ring */}
          <div className="flex-shrink-0 hidden sm:block">
            <LevelRing level={level} xpProgress={xpProgress} xpMax={500} size={110} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-[family-name:var(--font-mono)] text-[#00d4ff]/80 uppercase tracking-[0.3em] px-2.5 py-1 rounded-full border border-[#00d4ff]/20 bg-[#00d4ff]/5">
                {rank}
              </span>
              <span className="text-[10px] font-[family-name:var(--font-mono)] text-gray-600 uppercase tracking-[0.2em]">
                LVL {level}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-1 font-[family-name:var(--font-mono)]">
              {profile?.callsign ?? "Agent"}
            </h1>
            <p className="text-sm text-gray-500 mb-5 max-w-md">
              {tasksDone > 0
                ? `${tasksDone} tasks completed${streak > 0 ? ` · ${streak}d streak` : ""}`
                : "Start your first task to begin your mission."}
            </p>

            {/* Quick Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-[#00d4ff]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)] uppercase">XP</p>
                  <p className="text-sm text-white font-semibold font-[family-name:var(--font-mono)]">
                    {(profile?.totalXP ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Flame className="h-4 w-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)] uppercase">Streak</p>
                  <p className="text-sm text-white font-semibold font-[family-name:var(--font-mono)]">{streak}d</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)] uppercase">Duels</p>
                  <p className="text-sm text-white font-semibold font-[family-name:var(--font-mono)]">{duelsWon}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom neon line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00d4ff]/40 to-transparent" />
    </motion.div>
  );
}
