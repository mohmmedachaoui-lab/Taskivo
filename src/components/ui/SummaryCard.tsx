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
  color = "from-blue-500 to-blue-600",
  glow = "shadow-blue-500/20",
}: SummaryCardProps) {
  const isPositive = trend && trend > 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {trend !== undefined && (
            <div
              className={clsx(
                "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                isPositive
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500"
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
