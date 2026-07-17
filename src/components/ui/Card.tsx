"use client";

import { ReactNode } from "react";
import { clsx } from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-gray-800/60 bg-gray-900/80 p-6 shadow-sm transition-all duration-300 backdrop-blur-sm",
        hover && "hover:border-[#00d4ff]/30 hover:shadow-[0_0_20px_rgba(0,212,255,0.08)] cursor-pointer hover-glow",
        className
      )}
    >
      {children}
    </div>
  );
}
