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
import HeroSection from "@/components/dashboard/HeroSection";
import WeeklyActivity from "@/components/dashboard/WeeklyActivity";
import FeaturedPreview from "@/components/dashboard/FeaturedPreview";
import GoalBentoCard from "@/components/dashboard/GoalBentoCard";
import AIAgentCard from "@/components/dashboard/AIAgentCard";
import StreakCard from "@/components/dashboard/StreakCard";
import OnboardingChecklist from "@/components/ui/OnboardingChecklist";
import DashboardSkeleton from "@/components/ui/DashboardSkeleton";
import {
  DashTaskItem,
  DashDuelItem,
  DashGuildMember,
  DashFeedItem,
} from "@/components/dashboard/DashboardListItems";
import { AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Zap,
  Swords,
  Trophy,
  Activity,
  Target,
} from "lucide-react";
import { Guild, Duel, Task } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const profile = useAppStore(s => s.profile);
  const stats = useAppStore(s => s.stats);
  const [preview, setPreview] = useState<{ type: "task" | "duel" | "guild"; data: Task | Duel | Guild } | null>(null);

  const { friendUids } = useFriends(user?.uid);
  const { tasks, loading: tasksLoading } = useTasks(user?.uid);
  const { activeDuels, pendingDuels, loading: duelsLoading } = useRealtimeDuels(user?.uid);
  const { feed } = useRealtimeFeed(user?.uid, friendUids);

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
  const totalXP = profile?.totalXP ?? 0;

  const allDuels = [...activeDuels, ...pendingDuels];
  const activeTasks = tasks.filter((t) => t.completedSubtasks < t.totalSubtasks);
  const now = useCurrentTime(60000);

  const dashLoading = tasksLoading || duelsLoading;

  if (dashLoading) {
    return <DashboardSkeleton />;
  }

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
          <PulsingStatCard label="Total XP" value={totalXP} icon={Zap} color="#3b82f6" />
        </BentoCard>

        <BentoCard variant="yellow" delay={0.1}>
          <PulsingStatCard label="Missions Done" value={tasksDone} icon={CheckCircle2} color="#facc15" />
        </BentoCard>

        <BentoCard variant="cyan" delay={0.15}>
          <StreakCard />
        </BentoCard>

        <BentoCard variant="cyan" delay={0.2}>
          <PulsingStatCard label="Level" value={level} icon={Target} color="#00d4ff" />
        </BentoCard>

        {/* ===== WEEKLY GOAL + COMPANION ===== */}
        <BentoCard variant="cyan" delay={0.22}>
          <GoalBentoCard />
        </BentoCard>

        {/* ===== AI AGENT ===== */}
        <BentoCard variant="neutral" span={2} rowSpan={2} delay={0.24}>
          <AIAgentCard />
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
                  {activeTasks.slice(0, 8).map((task) => (
                    <DashTaskItem
                      key={task.id}
                      task={task}
                      onSelect={(t) => setPreview({ type: "task", data: t })}
                    />
                  ))}
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
                {allDuels.slice(0, 4).map((duel) => (
                  <DashDuelItem
                    key={duel.id}
                    duel={duel}
                    isChallenger={duel.challengerId === user?.uid}
                    now={now}
                    onSelect={(d) => setPreview({ type: "duel", data: d })}
                  />
                ))}
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
                  <DashGuildMember key={member.uid} member={member} rank={i} />
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
                {feed.slice(0, 8).map((item) => (
                  <DashFeedItem key={item.id} item={item} now={now} />
                ))}
              </div>
            </div>
          </BentoCard>
        )}

      </div>

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
