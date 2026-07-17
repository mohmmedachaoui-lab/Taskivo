"use client";

import { clsx } from "clsx";
import { TrendingUp, TrendingDown } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: React.ReactNode;
  color?: string;
  glow?: string;
}

export default function SummaryCard({
  title,
  value,
  trend,
  icon,
  color = "from-[#00d4ff] to-[#00a8cc]",
  glow = "shadow-[#00d4ff]/20",
}: SummaryCardProps) {
  const isPositive = trend && trend > 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-800/60 bg-gray-900/80 p-5 hover-glow transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {value}
          </p>
          {trend !== undefined && (
            <div
              className={clsx(
                "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                isPositive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isPositive ? "+" : ""}
              {trend}%
            </div>
          )}
        </div>
        <div
          className={clsx(
            "rounded-xl bg-gradient-to-br p-2.5 text-white shadow-lg",
            color,
            glow
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
