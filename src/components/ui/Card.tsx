"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { clsx } from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, hover = false, glass = true, onClick }: CardProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      whileTap={reducedMotion ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={clsx(
        "rounded-xl p-5 transition-all duration-300",
        glass
          ? "glass neon-border"
          : "bg-gray-900/80 border border-gray-800/60",
        hover && "hover-glow cursor-pointer",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
