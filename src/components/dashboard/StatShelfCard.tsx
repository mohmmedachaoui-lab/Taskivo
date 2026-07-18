"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatShelfCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  change?: number;
  color: string;
  index: number;
}

export default function StatShelfCard({
  label,
  value,
  icon,
  change,
  color,
  index,
}: StatShelfCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="shelf-card flex-shrink-0 w-[180px] rounded-xl overflow-hidden cursor-pointer"
      style={{ background: "rgba(10, 15, 25, 0.9)", border: "1px solid rgba(0, 212, 255, 0.1)" }}
    >
      <div className="p-4">
        {/* Icon */}
        <div
          className="h-9 w-9 rounded-lg flex items-center justify-center mb-3"
          style={{ background: `${color}10` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>

        {/* Label */}
        <p className="text-[10px] text-gray-500 font-[family-name:var(--font-mono)] uppercase tracking-[0.15em] mb-1">
          {label}
        </p>

        {/* Value + Change */}
        <div className="flex items-end justify-between">
          <span className="text-xl font-bold text-white font-[family-name:var(--font-mono)]">
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
          {change !== undefined && (
            <span
              className="text-[10px] font-semibold font-[family-name:var(--font-mono)] mb-0.5"
              style={{ color: change >= 0 ? "#10b981" : "#ef4444" }}
            >
              {change >= 0 ? "+" : ""}{change}%
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
