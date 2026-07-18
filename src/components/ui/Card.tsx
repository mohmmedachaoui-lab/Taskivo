"use client";

import { ReactNode } from "react";
import { clsx } from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

export default function Card({ children, className, hover = false, glass = true }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl p-5 transition-all duration-300",
        glass
          ? "glass neon-border"
          : "bg-gray-900/80 border border-gray-800/60",
        hover && "hover-glow cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
