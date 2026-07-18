"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface TaskShelfCardProps {
  title: string;
  category: string;
  total: number;
  completed: number;
  urgent?: boolean;
  index: number;
}

export default function TaskShelfCard({
  title,
  category,
  total,
  completed,
  urgent,
  index,
}: TaskShelfCardProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="shelf-card flex-shrink-0 w-[220px] rounded-xl overflow-hidden cursor-pointer"
      style={{ background: "rgba(10, 15, 25, 0.9)", border: "1px solid rgba(0, 212, 255, 0.1)" }}
    >
      {/* Top bar — progress */}
      <div className="h-1 w-full bg-white/[0.04]">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: urgent
              ? "linear-gradient(90deg, #f97316, #ef4444)"
              : "linear-gradient(90deg, #00d4ff, #3b82f6)",
          }}
        />
      </div>

      <div className="p-4">
        {/* Category badge */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <span
            className="text-[9px] font-[family-name:var(--font-mono)] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full"
            style={{
              background: urgent ? "rgba(249, 115, 22, 0.1)" : "rgba(0, 212, 255, 0.08)",
              color: urgent ? "#f97316" : "#00d4ff",
              border: `1px solid ${urgent ? "rgba(249, 115, 22, 0.2)" : "rgba(0, 212, 255, 0.15)"}`,
            }}
          >
            {urgent ? "URGENT" : category}
          </span>
          {urgent && <AlertTriangle className="h-3 w-3 text-orange-400 ml-auto" />}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-white mb-1 truncate">{title}</h3>

        {/* Progress */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] text-gray-500 font-[family-name:var(--font-mono)]">
            {completed}/{total}
          </span>
          <span
            className="text-[10px] font-semibold font-[family-name:var(--font-mono)]"
            style={{ color: pct >= 80 ? "#10b981" : pct >= 40 ? "#00d4ff" : "#6b7280" }}
          >
            {pct}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}
