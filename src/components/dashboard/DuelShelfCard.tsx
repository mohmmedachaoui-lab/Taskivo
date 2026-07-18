"use client";

import { motion } from "framer-motion";
import { Swords, Clock, Zap } from "lucide-react";

interface DuelShelfCardProps {
  opponent: string;
  stakeXP: number;
  status: "active" | "won" | "lost" | "pending";
  timeLeft?: string;
  xpChange?: number;
  index: number;
}

export default function DuelShelfCard({
  opponent,
  stakeXP,
  status,
  timeLeft,
  xpChange,
  index,
}: DuelShelfCardProps) {
  const statusConfig = {
    active: { color: "#00d4ff", bg: "rgba(0, 212, 255, 0.08)", border: "rgba(0, 212, 255, 0.2)", label: "IN PROGRESS" },
    won: { color: "#10b981", bg: "rgba(16, 185, 129, 0.08)", border: "rgba(16, 185, 129, 0.2)", label: "VICTORY" },
    lost: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.08)", border: "rgba(239, 68, 68, 0.2)", label: "DEFEAT" },
    pending: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.08)", border: "rgba(245, 158, 11, 0.2)", label: "PENDING" },
  };

  const cfg = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="shelf-card flex-shrink-0 w-[200px] rounded-xl overflow-hidden cursor-pointer"
      style={{ background: "rgba(10, 15, 25, 0.9)", border: `1px solid ${cfg.border}` }}
    >
      {/* Top status bar */}
      <div className="h-1 w-full" style={{ background: cfg.color }} />

      <div className="p-4">
        {/* Status badge */}
        <div className="flex items-center gap-1.5 mb-3">
          <span
            className="text-[9px] font-[family-name:var(--font-mono)] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Opponent */}
        <div className="flex items-center gap-2 mb-3">
          <Swords className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-semibold text-white truncate">{opponent}</span>
        </div>

        {/* Stake */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-[#00d4ff]" />
            <span className="text-[10px] text-gray-500 font-[family-name:var(--font-mono)]">
              {stakeXP} XP
            </span>
          </div>
          {timeLeft && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-gray-600" />
              <span className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)]">{timeLeft}</span>
            </div>
          )}
          {xpChange !== undefined && (
            <span
              className="text-[10px] font-semibold font-[family-name:var(--font-mono)]"
              style={{ color: xpChange > 0 ? "#10b981" : "#ef4444" }}
            >
              {xpChange > 0 ? "+" : ""}{xpChange}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
