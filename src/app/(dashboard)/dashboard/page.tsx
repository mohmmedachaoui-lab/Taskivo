"use client";

import { useState, useCallback, useEffect } from "react";
import { useAppStore } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { calculateLevel } from "@/lib/xp-engine";
import { useTasks } from "@/hooks/useTasks";
import { useRealtimeDuels } from "@/hooks/useRealtimeDuels";
import { useRealtimeFeed } from "@/hooks/useRealtimeFeed";
import { useFriends } from "@/hooks/useFriends";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { getUserGuild, getGuildMembers } from "@/lib/social";
import BentoCard from "@/components/ui/BentoCard";
import PulsingStatCard from "@/components/ui/PulsingStatCard";
import ParticleBurst from "@/components/ui/ParticleBurst";
import HeroSection from "@/components/dashboard/HeroSection";
import WeeklyActivity from "@/components/dashboard/WeeklyActivity";
import FeaturedPreview from "@/components/dashboard/FeaturedPreview";
import GoalBentoCard from "@/components/dashboard/GoalBentoCard";
import OnboardingChecklist from "@/components/ui/OnboardingChecklist";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Flame,
  Zap,
  Swords,
  Trophy,
  TrendingUp,
  Activity,
  Target,
  Users,
} from "lucide-react";
import { Guild, Duel, Task } from "@/types";

const FEED_ICONS: Record<string, typeof Activity> = {
  task_completed: CheckCircle2,
  duel_won: Trophy,
  duel_lost: Swords,
  level_up: TrendingUp,
  achievement: Trophy,
  streak: Flame,
  guild_join: Users,
};

const FEED_COLORS: Record<string, string> = {
  task_completed: "#10b981",
  duel_won: "#facc15",
  duel_lost: "#ef4444",
  level_up: "#00d4ff",
  achievement: "#facc15",
  streak: "#f97316",
  guild_join: "#a855f7",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { profile, stats } = useAppStore();
  const [preview, setPreview] = useState<{ type: "task" | "duel" | "guild"; data: Task | Duel | Guild } | null>(null);
  const [taskBurst, setTaskBurst] = useState<string | null>(null);

  // Real-time data
  const { friendUids } = useFriends(user?.uid);
  const { tasks } = useTasks(user?.uid);
  const { activeDuels, pendingDuels } = useRealtimeDuels(user?.uid);
  const { feed } = useRealtimeFeed(user?.uid, friendUids);

  // Guild (polled)
  const [guild, setGuild] = useState<Guild | null>(null);
  const [guildMembers, setGuildMembers] = useState<{ uid: string; callsign: string; totalXP: number }[]>([]);

  const loadGuild = useCallback(async () => {
    if (!user) return;
    try {
      const g = await getUserGuild(user.uid);
      setGuild(g);
      if (g && g.members.length > 0) {
        const members = await getGuildMembers(g.members);
        setGuildMembers(members.sort((a, b) => b.totalXP - a.totalXP).slice(0, 6));
      }
    } catch (err) {
      console.error("Failed to load guild:", err);
    }
  }, [user]);

  useEffect(() => {
    loadGuild();
    const interval = setInterval(loadGuild, 30000);
    return () => clearInterval(interval);
  }, [loadGuild]);

  const level = profile ? calculateLevel(profile.totalXP) : 1;
  const tasksDone = stats?.tasksCompleted ?? 0;
  const dayStreak = stats?.currentStreak ?? 0;
  const totalXP = profile?.totalXP ?? 0;

  const allDuels = [...activeDuels, ...pendingDuels];
  const activeTasks = tasks.filter((t) => !t.completed);
  const now = useCurrentTime(60000);

  const getRelativeTime = (ts: number) => {
    const diff = now - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="-mx-4 lg:-mx-6 -mt-4 lg:-mt-6 p-4 lg:p-6">
      <div className="bento-grid">

        {/* ===== HERO — spans 2 cols, 2 rows ===== */}
        <BentoCard variant="cyan" span={2} rowSpan={2} delay={0}>
          <HeroSection />
        </BentoCard>

        {/* ===== ONBOARDING CHECKLIST ===== */}
        <BentoCard variant="purple" span={2} delay={0.03}>
          <OnboardingChecklist />
        </BentoCard>

        {/* ===== STAT CARDS ===== */}
        <BentoCard variant="cyan" delay={0.05}>
          <PulsingStatCard
            label="Total XP"
            value={totalXP}
            icon={Zap}
            color="#3b82f6"
          />
        </BentoCard>

        <BentoCard variant="yellow" delay={0.1}>
          <PulsingStatCard
            label="Tasks Done"
            value={tasksDone}
            icon={CheckCircle2}
            color="#facc15"
          />
        </BentoCard>

        <BentoCard variant="cyan" delay={0.15}>
          <PulsingStatCard
            label="Day Streak"
            value={dayStreak}
            icon={Flame}
            color="#f97316"
            suffix="d"
          />
        </BentoCard>

        <BentoCard variant="cyan" delay={0.2}>
          <PulsingStatCard
            label="Level"
            value={level}
            icon={Target}
            color="#00d4ff"
          />
        </BentoCard>

        {/* ===== WEEKLY GOAL + COMPANION ===== */}
        <BentoCard variant="cyan" delay={0.22}>
          <GoalBentoCard />
        </BentoCard>

        {/* ===== ACTIVE TASKS — yellow module ===== */}
        {activeTasks.length > 0 && (
          <BentoCard variant="yellow" span={2} rowSpan={2} delay={0.25}>
            <div className="p-5 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(250, 204, 21, 0.1), rgba(250, 204, 21, 0.03))",
                    border: "1px solid rgba(250, 204, 21, 0.12)",
                  }}
                >
                  <Target className="h-3.5 w-3.5 text-[#facc15]" style={{ filter: "drop-shadow(0 0 3px rgba(250, 204, 21, 0.4))" }} strokeWidth={2.5} />
                </div>
                <h3 className="text-xs font-semibold text-[#facc15]/80 font-[family-name:var(--font-mono)] uppercase tracking-[0.2em]">
                  Active Missions
                </h3>
                <span className="ml-auto badge badge-yellow" style={{ padding: "2px 6px", fontSize: "8px" }}>
                  {activeTasks.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                <AnimatePresence mode="popLayout">
                  {activeTasks.slice(0, 8).map((task) => {
                    const pct = task.completed ? 100 : 0;
                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.25 } }}
                        onClick={() => setPreview({ type: "task", data: task })}
                        onMouseEnter={() => setTaskBurst(task.id)}
                        className="relative rounded-xl px-4 py-3 cursor-pointer transition-colors hover:bg-[#facc15]/[0.04] group"
                        style={{ border: "1px solid rgba(250, 204, 21, 0.06)" }}
                      >
                        <ParticleBurst active={taskBurst === task.id} color="#facc15" count={16} onComplete={() => setTaskBurst(null)} />
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-semibold text-white truncate pr-2">{task.title}</p>
                          <span className="text-[10px] font-[family-name:var(--font-mono)] text-[#facc15]">
                            {pct}%
                          </span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-white/[0.04] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            style={{ background: "linear-gradient(90deg, #facc15, #f59e0b)" }}
                          />
                        </div>
                        {task.urgent && (
                          <span className="absolute top-2 right-2 text-[8px] text-orange-400 font-[family-name:var(--font-mono)] uppercase">
                            URGENT
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </BentoCard>
        )}

        {/* ===== WAR ROOM — red module ===== */}
        {allDuels.length > 0 && (
          <BentoCard variant="red" span={2} delay={0.3}>
            <div className="p-5 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.03))",
                    border: "1px solid rgba(239, 68, 68, 0.12)",
                  }}
                >
                  <Swords className="h-3.5 w-3.5 text-red-400" style={{ filter: "drop-shadow(0 0 3px rgba(239, 68, 68, 0.4))" }} strokeWidth={2.5} />
                </div>
                <h3 className="text-xs font-semibold text-gray-400 font-[family-name:var(--font-mono)] uppercase tracking-[0.2em]">
                  War Room
                </h3>
              </div>
              <div className="flex-1 space-y-2">
                {allDuels.slice(0, 4).map((duel) => {
                  const isChallenger = duel.challengerId === user?.uid;
                  const opponent = isChallenger ? duel.opponentName : duel.challengerName;
                  const isActive = duel.status === "active";
                  const timeLeft = duel.endTime > now
                    ? `${Math.floor((duel.endTime - now) / 3600000)}h left`
                    : "Expired";
                  return (
                    <div
                      key={duel.id}
                      onClick={() => setPreview({ type: "duel", data: duel })}
                      className="rounded-xl px-4 py-3 cursor-pointer transition-colors hover:bg-white/[0.02]"
                      style={{ border: "1px solid rgba(255, 255, 255, 0.04)" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`h-2 w-2 rounded-full flex-shrink-0 ${isActive ? "bg-emerald-400 animate-pulse" : "bg-yellow-400"}`} />
                          <p className="text-sm font-semibold text-white truncate">vs {opponent}</p>
                        </div>
                        <span className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)] flex-shrink-0 ml-2">
                          {timeLeft}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] font-[family-name:var(--font-mono)] text-[#00d4ff]">
                          {duel.stakeXP} XP
                        </span>
                        <span className={`text-[10px] font-[family-name:var(--font-mono)] uppercase ${isActive ? "text-emerald-400" : "text-yellow-400"}`}>
                          {isActive ? "ACTIVE" : "PENDING"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </BentoCard>
        )}

        {/* ===== GUILD — purple module ===== */}
        {guild && (
          <BentoCard variant="purple" span={2} rowSpan={2} delay={0.35}>
            <div className="p-5 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.03))",
                    border: "1px solid rgba(168, 85, 247, 0.12)",
                  }}
                >
                  <Trophy className="h-3.5 w-3.5 text-[#a855f7]" style={{ filter: "drop-shadow(0 0 3px rgba(168, 85, 247, 0.4))" }} strokeWidth={2.5} />
                </div>
                <h3 className="text-xs font-semibold text-[#a855f7]/80 font-[family-name:var(--font-mono)] uppercase tracking-[0.2em]">
                  {guild.name}
                </h3>
                <span className="ml-auto badge badge-purple" style={{ padding: "2px 6px", fontSize: "8px" }}>
                  {guild.memberCount} members
                </span>
              </div>
              <div className="flex-1 space-y-1.5 min-h-0 overflow-y-auto">
                {guildMembers.map((member, i) => (
                  <div
                    key={member.uid}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#a855f7]/[0.04] transition-colors"
                  >
                    <span className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)] w-5 text-center">
                      {i === 0 ? "👑" : `#${i + 1}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{member.callsign}</p>
                    </div>
                    <span className="text-[10px] text-[#a855f7] font-[family-name:var(--font-mono)]">
                      {member.totalXP.toLocaleString()} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>
        )}

        {/* ===== WEEKLY ACTIVITY ===== */}
        <BentoCard variant="cyan" span={2} delay={0.4}>
          <WeeklyActivity />
        </BentoCard>

        {/* ===== LIVE FEED ===== */}
        {feed.length > 0 && (
          <BentoCard variant="neutral" span={2} delay={0.45}>
            <div className="p-5 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(0, 212, 255, 0.03))",
                    border: "1px solid rgba(0, 212, 255, 0.1)",
                  }}
                >
                  <Activity className="h-3.5 w-3.5 text-[#00d4ff]" style={{ filter: "drop-shadow(0 0 3px rgba(0, 212, 255, 0.4))" }} strokeWidth={2.5} />
                </div>
                <h3 className="text-xs font-semibold text-gray-400 font-[family-name:var(--font-mono)] uppercase tracking-[0.2em]">
                  Live Feed
                </h3>
                <div className="ml-auto badge badge-online" style={{ padding: "2px 6px", fontSize: "8px" }}>
                  <span className="badge-dot" />
                  LIVE
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
                {feed.slice(0, 8).map((item) => {
                  const FeedIcon = FEED_ICONS[item.type] || Activity;
                  const iconColor = FEED_COLORS[item.type] || "#6b7280";
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.02] transition-colors"
                    >
                      <FeedIcon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: iconColor }} strokeWidth={2.5} />
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
                    </div>
                  );
                })}
              </div>
            </div>
          </BentoCard>
        )}

      </div>

      {/* FEATURED PREVIEW */}
      {preview && (
        <FeaturedPreview
          type={preview.type}
          data={preview.data as unknown as Record<string, unknown>}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
