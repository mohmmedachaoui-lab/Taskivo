"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import ParticleBurst from "@/components/ui/ParticleBurst";
import { Task, Duel } from "@/types";
import {
  CheckCircle2,
  Trophy,
  Swords,
  TrendingUp,
  Flame,
  Users,
  Activity,
} from "lucide-react";

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

interface DashTaskItemProps {
  task: Task;
  onSelect: (task: Task) => void;
}

export const DashTaskItem = memo(function DashTaskItem({ task, onSelect }: DashTaskItemProps) {
  const [hovered, setHovered] = useState(false);
  const pct = task.totalSubtasks > 0
    ? Math.round((task.completedSubtasks / task.totalSubtasks) * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.25 } }}
      onClick={() => onSelect(task)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-xl px-4 py-3 cursor-pointer transition-colors hover:bg-[#facc15]/[0.04] group"
      style={{ border: "1px solid rgba(250, 204, 21, 0.06)" }}
    >
      <ParticleBurst active={hovered} color="#facc15" count={16} />
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
});

interface DashDuelItemProps {
  duel: Duel;
  isChallenger: boolean;
  now: number;
  onSelect: (duel: Duel) => void;
}

export const DashDuelItem = memo(function DashDuelItem({ duel, isChallenger, now, onSelect }: DashDuelItemProps) {
  const opponent = isChallenger ? duel.opponentName : duel.challengerName;
  const isActive = duel.status === "active";
  const timeLeft = duel.endTime > now
    ? `${Math.floor((duel.endTime - now) / 3600000)}h left`
    : "Expired";

  return (
    <div
      onClick={() => onSelect(duel)}
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
});

interface DashGuildMemberProps {
  member: { uid: string; callsign: string; totalXP: number };
  rank: number;
}

export const DashGuildMember = memo(function DashGuildMember({ member, rank }: DashGuildMemberProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#a855f7]/[0.04] transition-colors">
      <span className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)] w-5 text-center">
        {rank === 0 ? "👑" : `#${rank + 1}`}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{member.callsign}</p>
      </div>
      <span className="text-[10px] text-[#a855f7] font-[family-name:var(--font-mono)]">
        {member.totalXP.toLocaleString()} XP
      </span>
    </div>
  );
});

interface DashFeedItemProps {
  item: {
    id: string;
    type: string;
    callsign: string;
    message: string;
    xpChange: number;
    createdAt: number;
  };
  now: number;
}

export const DashFeedItem = memo(function DashFeedItem({ item, now }: DashFeedItemProps) {
  const FeedIcon = FEED_ICONS[item.type] || Activity;
  const iconColor = FEED_COLORS[item.type] || "#6b7280";

  const diff = now - item.createdAt;
  const mins = Math.floor(diff / 60000);
  const timeAgo = mins < 1 ? "now" : mins < 60 ? `${mins}m` : Math.floor(mins / 60) < 24 ? `${Math.floor(mins / 60)}h` : `${Math.floor(mins / 60 / 24)}d`;

  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.02] transition-colors">
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
          {timeAgo}
        </span>
      </div>
    </div>
  );
});
