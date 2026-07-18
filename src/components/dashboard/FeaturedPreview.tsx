"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Swords, Trophy, CheckCircle2 } from "lucide-react";

interface FeaturedPreviewSubtask {
  done: boolean;
  title: string;
}

interface FeaturedPreviewData {
  category?: string;
  urgent?: boolean;
  title?: string;
  description?: string;
  total?: number;
  completed?: number;
  tasks?: FeaturedPreviewSubtask[];
  status?: string;
  opponent?: string;
  stakeXP?: number;
  timeLeft?: string;
  xpChange?: number;
  name?: string;
  memberCount?: number;
  topPlayer?: string;
  topXP?: number;
}

interface FeaturedPreviewProps {
  type: "task" | "duel" | "guild" | "stat";
  data: Record<string, unknown>;
  onClose: () => void;
}

export default function FeaturedPreview({ type, data, onClose }: FeaturedPreviewProps) {
  if (!data) return null;

  const d = data as FeaturedPreviewData;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed bottom-28 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-[480px] rounded-2xl overflow-hidden preview-slide-in"
        style={{
          background: "rgba(8, 12, 22, 0.95)",
          border: "1px solid rgba(0, 212, 255, 0.2)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 212, 255, 0.05)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 h-6 w-6 rounded-full bg-white/[0.05] flex items-center justify-center
                     hover:bg-white/[0.1] transition-colors"
        >
          <X className="h-3 w-3 text-gray-500" />
        </button>

        {/* Content by type */}
        {type === "task" && (
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-[family-name:var(--font-mono)] text-[#00d4ff] uppercase tracking-widest px-2 py-0.5 rounded-full border border-[#00d4ff]/20 bg-[#00d4ff]/5">
                {d.category ?? "TASK"}
              </span>
              {d.urgent && (
                <span className="text-[9px] font-[family-name:var(--font-mono)] text-orange-400 uppercase tracking-widest px-2 py-0.5 rounded-full border border-orange-400/20 bg-orange-400/5">
                  URGENT
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{d.title}</h3>
            <p className="text-xs text-gray-500 mb-4 line-clamp-2">{d.description ?? "No description available."}</p>

            {/* Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-gray-500 font-[family-name:var(--font-mono)]">Progress</span>
                <span className="text-[10px] text-[#00d4ff] font-[family-name:var(--font-mono)]">
                  {(d.total ?? 0) > 0 ? Math.round(((d.completed ?? 0) / (d.total ?? 1)) * 100) : 0}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(d.total ?? 0) > 0 ? ((d.completed ?? 0) / (d.total ?? 1)) * 100 : 0}%`,
                    background: "linear-gradient(90deg, #00d4ff, #3b82f6)",
                  }}
                />
              </div>
            </div>

            {/* Tasks list */}
            {d.tasks && d.tasks.length > 0 && (
              <div className="space-y-1.5">
                {d.tasks.slice(0, 3).map((task: FeaturedPreviewSubtask, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    {task.done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border border-gray-700 flex-shrink-0" />
                    )}
                    <span className={`text-[11px] truncate ${task.done ? "text-gray-500 line-through" : "text-gray-300"}`}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {type === "duel" && (
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Swords className="h-4 w-4 text-[#00d4ff]" />
              <span className="text-[9px] font-[family-name:var(--font-mono)] text-[#00d4ff] uppercase tracking-widest">
                {d.status === "active" ? "IN PROGRESS" : d.status === "won" ? "VICTORY" : d.status === "lost" ? "DEFEAT" : "PENDING"}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">vs {d.opponent}</h3>
            <p className="text-xs text-gray-500 mb-4">{d.description ?? "Compete for XP."}</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white/[0.03] p-3">
                <p className="text-[9px] text-gray-600 font-[family-name:var(--font-mono)] uppercase mb-1">Stake</p>
                <p className="text-sm text-white font-semibold font-[family-name:var(--font-mono)]">{d.stakeXP} XP</p>
              </div>
              {d.timeLeft && (
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-[9px] text-gray-600 font-[family-name:var(--font-mono)] uppercase mb-1">Time Left</p>
                  <p className="text-sm text-white font-semibold font-[family-name:var(--font-mono)]">{d.timeLeft}</p>
                </div>
              )}
              {d.xpChange !== undefined && (
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-[9px] text-gray-600 font-[family-name:var(--font-mono)] uppercase mb-1">XP Change</p>
                  <p className={`text-sm font-semibold font-[family-name:var(--font-mono)] ${(d.xpChange ?? 0) > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {(d.xpChange ?? 0) > 0 ? "+" : ""}{d.xpChange}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {type === "guild" && (
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4 text-yellow-400" />
              <span className="text-[9px] font-[family-name:var(--font-mono)] text-yellow-400 uppercase tracking-widest">
                GUILD DETAILS
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{d.name}</h3>
            <p className="text-xs text-gray-500 mb-4">{d.memberCount} members · {d.description ?? "A competitive guild."}</p>

            {d.topPlayer && (
              <div className="rounded-lg bg-white/[0.03] p-3">
                <p className="text-[9px] text-gray-600 font-[family-name:var(--font-mono)] uppercase mb-1">Top Player</p>
                <p className="text-sm text-white font-semibold">{d.topPlayer}</p>
                <p className="text-[10px] text-yellow-400 font-[family-name:var(--font-mono)]">{d.topXP?.toLocaleString()} XP</p>
              </div>
            )}
          </div>
        )}

        {/* Bottom neon line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#00d4ff]/30 to-transparent" />
      </motion.div>
    </AnimatePresence>
  );
}
