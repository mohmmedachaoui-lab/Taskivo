"use client";

import { motion } from "framer-motion";
import { Users, Trophy, Crown } from "lucide-react";

interface GuildShelfCardProps {
  name: string;
  memberCount: number;
  topXP: number;
  topPlayer: string;
  rank: number;
  index: number;
}

export default function GuildShelfCard({
  name,
  memberCount,
  topXP,
  topPlayer,
  rank,
  index,
}: GuildShelfCardProps) {
  const rankColors: Record<number, string> = {
    1: "#f59e0b",
    2: "#94a3b8",
    3: "#cd7f32",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="shelf-card flex-shrink-0 w-[220px] rounded-xl overflow-hidden cursor-pointer"
      style={{ background: "rgba(10, 15, 25, 0.9)", border: "1px solid rgba(0, 212, 255, 0.1)" }}
    >
      {/* Top accent */}
      <div
        className="h-1 w-full"
        style={{
          background: rank <= 3
            ? `linear-gradient(90deg, ${rankColors[rank] ?? "#00d4ff"}, transparent)`
            : "linear-gradient(90deg, rgba(0, 212, 255, 0.3), transparent)",
        }}
      />

      <div className="p-4">
        {/* Guild Rank */}
        {rank <= 3 && (
          <div className="flex items-center gap-1 mb-2">
            <Crown className="h-3 w-3" style={{ color: rankColors[rank] }} />
            <span
              className="text-[9px] font-[family-name:var(--font-mono)] uppercase tracking-widest"
              style={{ color: rankColors[rank] }}
            >
              #{rank} GUILD
            </span>
          </div>
        )}

        {/* Name */}
        <h3 className="text-sm font-bold text-white mb-2 truncate">{name}</h3>

        {/* Members */}
        <div className="flex items-center gap-1.5 mb-3">
          <Users className="h-3 w-3 text-gray-500" />
          <span className="text-[10px] text-gray-500 font-[family-name:var(--font-mono)]">
            {memberCount} members
          </span>
        </div>

        {/* Top player */}
        {topPlayer && (
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
            <span className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)] truncate max-w-[120px]">
              {topPlayer}
            </span>
            <div className="flex items-center gap-1">
              <Trophy className="h-3 w-3 text-yellow-500" />
              <span className="text-[10px] text-yellow-400 font-[family-name:var(--font-mono)]">
                {topXP.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
