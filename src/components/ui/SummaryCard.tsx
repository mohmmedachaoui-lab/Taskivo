"use client";

import { clsx } from "clsx";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: React.ReactNode;
  color?: string;
  glow?: string;
  penalty?: number;
}

export default function SummaryCard({
  title,
  value,
  trend,
  icon,
  color = "from-[#00d4ff] to-blue-600",
  glow = "shadow-[#00d4ff]/20",
  penalty,
}: SummaryCardProps) {
  const isPositive = trend && trend > 0;

  return (
    <div className="relative overflow-hidden rounded-xl glass neon-border p-4 hover-glow transition-all duration-300 corner-accent">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-[family-name:var(--font-mono)]">
            {title}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-white font-[family-name:var(--font-mono)]">
            {value}
          </p>
          {trend !== undefined && (
            <div
              className={clsx(
                "mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium font-[family-name:var(--font-mono)]",
                isPositive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              )}
            >
              {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
              {isPositive ? "+" : ""}{trend}%
            </div>
          )}
          {penalty !== undefined && penalty > 0 && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-400 font-[family-name:var(--font-mono)]">
              <AlertTriangle className="h-2.5 w-2.5" />
              -{penalty.toLocaleString()} XP LOST
            </div>
          )}
        </div>
        <div
          className={clsx(
            "rounded-lg bg-gradient-to-br p-2 text-white shadow-lg",
            color,
            glow
          )}
        >
          {icon}
        </div>
      </div>
      {/* Bottom neon accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00d4ff]/20 to-transparent" />
    </div>
  );
}
