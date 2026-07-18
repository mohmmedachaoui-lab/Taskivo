"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import {
  calculateXPProgress,
  getRankTitle,
  calculateLevel,
} from "@/lib/xp-engine";
import { getFriends, getActivityFeed, getUserDuels, getUserGuild, getGuildMembers } from "@/lib/social";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import HeroSection from "@/components/dashboard/HeroSection";
import Shelf from "@/components/ui/Shelf";
import TaskShelfCard from "@/components/dashboard/TaskShelfCard";
import DuelShelfCard from "@/components/dashboard/DuelShelfCard";
import GuildShelfCard from "@/components/dashboard/GuildShelfCard";
import StatShelfCard from "@/components/dashboard/StatShelfCard";
import FeaturedPreview from "@/components/dashboard/FeaturedPreview";
import WeeklyActivity from "@/components/dashboard/WeeklyActivity";
import LevelRing from "@/components/gamification/LevelRing";
import Card from "@/components/ui/Card";
import { useDeepMode } from "@/components/ui/DeepMode";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Flame,
  Zap,
  Swords,
  Trophy,
  TrendingUp,
  Activity,
  Eye,
  Target,
  Clock,
  Brain,
  Shield,
} from "lucide-react";
import { ActivityFeedItem, Duel, Guild, Task } from "@/types";

const FEED_ICONS: Record<string, React.ReactNode> = {
  task_completed: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
  duel_won: <Trophy className="h-3.5 w-3.5 text-yellow-400" />,
  duel_lost: <Swords className="h-3.5 w-3.5 text-red-400" />,
  level_up: <TrendingUp className="h-3.5 w-3.5 text-[#00d4ff]" />,
  achievement: <Trophy className="h-3.5 w-3.5 text-yellow-400" />,
  streak: <Flame className="h-3.5 w-3.5 text-orange-400" />,
  guild_join: <Activity className="h-3.5 w-3.5 text-blue-400" />,
};

interface ShelfTask {
  id: string;
  title: string;
  category: string;
  total: number;
  completed: number;
  urgent: boolean;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { profile, stats } = useAppStore();
  const { isDeep, toggleDeep } = useDeepMode();
  const [feed, setFeed] = useState<ActivityFeedItem[]>([]);
  const [tasks, setTasks] = useState<ShelfTask[]>([]);
  const [duels, setDuels] = useState<Duel[]>([]);
  const [guild, setGuild] = useState<Guild | null>(null);
  const [guildMembers, setGuildMembers] = useState<{ uid: string; callsign: string; totalXP: number }[]>([]);
  const [preview, setPreview] = useState<{ type: "task" | "duel" | "guild" | "stat"; data: any } | null>(null);

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

  const loadDuels = useCallback(async () => {
    if (!user) return;
    try {
      const d = await getUserDuels(user.uid);
      setDuels(d.filter((duel) => duel.status === "pending" || duel.status === "active"));
    } catch (err) {
      console.error("Failed to load duels:", err);
    }
  }, [user]);

  const loadGuild = useCallback(async () => {
    if (!user) return;
    try {
      const g = await getUserGuild(user.uid);
      setGuild(g);
      if (g && g.members.length > 0) {
        const members = await getGuildMembers(g.members);
        setGuildMembers(members.sort((a, b) => b.totalXP - a.totalXP).slice(0, 10));
      }
    } catch (err) {
      console.error("Failed to load guild:", err);
    }
  }, [user]);

  // Live tasks listener from Firestore
  useEffect(() => {
    if (!user) return;
    const db = getFirebaseDb();
    const q = query(
      collection(db, "tasks"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const unsub = onSnapshot(q, (snap) => {
      const items: ShelfTask[] = snap.docs.map((d) => {
        const data = d.data() as any;
        const subtasks: any[] = data.subtasks ?? [];
        const done = subtasks.filter((s: any) => s.done).length;
        return {
          id: d.id,
          title: data.title ?? "Untitled",
          category: data.category ?? data.difficulty ?? "task",
          total: subtasks.length || 1,
          completed: done,
          urgent: data.urgent ?? false,
        };
      });
      setTasks(items);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    loadFeed();
    loadDuels();
    loadGuild();
    const interval = setInterval(() => {
      loadFeed();
      loadDuels();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadFeed, loadDuels, loadGuild]);

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

  const activeTasks = tasks.filter((t) => t.completed < t.total);
  const completedTasks = tasks.filter((t) => t.completed >= t.total);

  return (
    <div className="space-y-8 -mx-4 lg:-mx-6 -mt-4 lg:-mt-6">
      {/* HERO */}
      <div className="px-4 lg:px-6 pt-4 lg:pt-6">
        <HeroSection />
      </div>

      {/* QUICK STATS SHELF */}
      <div className="px-4 lg:px-6">
        <Shelf title="Overview" delay={0.1}>
          <StatShelfCard
            label="Total XP"
            value={totalXP}
            icon={<Zap className="h-4 w-4" />}
            change={undefined}
            color="#00d4ff"
            index={0}
          />
          <StatShelfCard
            label="Tasks Done"
            value={tasksDone}
            icon={<CheckCircle2 className="h-4 w-4" />}
            color="#10b981"
            index={1}
          />
          <StatShelfCard
            label="Day Streak"
            value={`${dayStreak}d`}
            icon={<Flame className="h-4 w-4" />}
            color="#f97316"
            index={2}
          />
          <StatShelfCard
            label="XP Lost"
            value={xpLost}
            icon={<TrendingUp className="h-4 w-4" />}
            color="#ef4444"
            index={3}
          />
          <StatShelfCard
            label="Level"
            value={level}
            icon={<Target className="h-4 w-4" />}
            color="#8b5cf6"
            index={4}
          />
          <StatShelfCard
            label="Rank"
            value={rank}
            icon={<Shield className="h-4 w-4" />}
            color="#00d4ff"
            index={5}
          />
        </Shelf>
      </div>

      {/* ACTIVE TASKS SHELF */}
      {activeTasks.length > 0 && (
        <div className="px-4 lg:px-6">
          <Shelf title="Active Missions" icon={<Target className="h-3.5 w-3.5" />} delay={0.15}>
            {activeTasks.map((task, i) => (
              <div
                key={task.id}
                onMouseEnter={() => setPreview({ type: "task", data: task })}
                onMouseLeave={() => setPreview(null)}
              >
                <TaskShelfCard
                  title={task.title}
                  category={task.category}
                  progress={task.completed}
                  total={task.total}
                  completed={task.completed}
                  urgent={task.urgent}
                  index={i}
                />
              </div>
            ))}
          </Shelf>
        </div>
      )}

      {/* WAR ROOM SHELF */}
      {duels.length > 0 && (
        <div className="px-4 lg:px-6">
          <Shelf title="War Room" icon={<Swords className="h-3.5 w-3.5" />} delay={0.2}>
            {duels.map((duel, i) => (
              <div
                key={duel.id}
                onMouseEnter={() => setPreview({ type: "duel", data: duel })}
                onMouseLeave={() => setPreview(null)}
              >
                <DuelShelfCard
                  opponent={duel.challengerId === user?.uid ? duel.opponentName : duel.challengerName}
                  stakeXP={duel.stakeXP}
                  status={duel.status === "active" ? "active" : "pending"}
                  timeLeft={
                    duel.endTime > Date.now()
                      ? `${Math.floor((duel.endTime - Date.now()) / 3600000)}h`
                      : undefined
                  }
                  index={i}
                />
              </div>
            ))}
          </Shelf>
        </div>
      )}

      {/* GUILD SHELF */}
      {guild && (
        <div className="px-4 lg:px-6">
          <Shelf title="Guild" icon={<Trophy className="h-3.5 w-3.5" />} delay={0.25}>
            <div
              onMouseEnter={() => setPreview({ type: "guild", data: guild })}
              onMouseLeave={() => setPreview(null)}
            >
              <GuildShelfCard
                name={guild.name}
                memberCount={guild.memberCount}
                topXP={guildMembers[0]?.totalXP ?? 0}
                topPlayer={guildMembers[0]?.callsign ?? ""}
                rank={1}
                index={0}
              />
            </div>
            {guildMembers.slice(0, 6).map((member, i) => (
              <motion.div
                key={member.uid}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (i + 1) * 0.04 }}
                className="shelf-card flex-shrink-0 w-[160px] rounded-xl overflow-hidden"
                style={{ background: "rgba(10, 15, 25, 0.9)", border: "1px solid rgba(0, 212, 255, 0.08)" }}
              >
                <div className="p-3.5">
                  <p className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)] uppercase tracking-widest mb-1">
                    #{i + 1}
                  </p>
                  <p className="text-sm font-semibold text-white truncate">{member.callsign}</p>
                  <p className="text-[10px] text-[#00d4ff] font-[family-name:var(--font-mono)]">
                    {member.totalXP.toLocaleString()} XP
                  </p>
                </div>
              </motion.div>
            ))}
          </Shelf>
        </div>
      )}

      {/* ACTIVITY FEED SHELF */}
      {feed.length > 0 && (
        <div className="px-4 lg:px-6">
          <Shelf title="Live Feed" icon={<Activity className="h-3.5 w-3.5" />} delay={0.3}>
            {feed.slice(0, 12).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="shelf-card flex-shrink-0 w-[240px] rounded-xl overflow-hidden"
                style={{ background: "rgba(10, 15, 25, 0.9)", border: "1px solid rgba(0, 212, 255, 0.06)" }}
              >
                <div className="p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    {FEED_ICONS[item.type] || <Activity className="h-3.5 w-3.5 text-gray-600" />}
                    <span className="text-[10px] text-gray-500 font-[family-name:var(--font-mono)] uppercase tracking-widest">
                      {item.type.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">
                    <span className="text-white font-medium">{item.callsign}</span>{" "}
                    {item.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    {item.xpChange !== 0 && (
                      <span className={`text-[10px] font-[family-name:var(--font-mono)] font-medium ${item.xpChange > 0 ? "text-[#00d4ff]" : "text-red-400"}`}>
                        {item.xpChange > 0 ? "+" : ""}{item.xpChange}
                      </span>
                    )}
                    <span className="text-[9px] text-gray-700 font-[family-name:var(--font-mono)] ml-auto">
                      {getRelativeTime(item.createdAt)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </Shelf>
        </div>
      )}

      {/* WEEKLY CHART + LEVEL RING */}
      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="lg:col-span-2 deep-dim"
          >
            <WeeklyActivity />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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
      </div>

      {/* BOTTOM SPACER */}
      <div className="h-4" />

      {/* FEATURED PREVIEW */}
      {preview && (
        <FeaturedPreview
          type={preview.type}
          data={preview.data}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
