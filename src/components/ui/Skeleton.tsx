"use client";

import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export default function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            "shimmer rounded-xl bg-white/[0.03] border border-white/[0.04]",
            className
          )}
        />
      ))}
    </div>
  );
}
