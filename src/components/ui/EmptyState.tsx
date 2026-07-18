"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import Button from "./Button";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  accent?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  accent = "#00d4ff",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div
        className="relative mb-6"
        style={{ animation: "float 4s ease-in-out infinite" }}
      >
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-20"
          style={{ background: accent, transform: "scale(2.5)" }}
        />
        <div
          className="relative flex h-20 w-20 items-center justify-center rounded-2xl border"
          style={{
            background: `linear-gradient(135deg, ${accent}08, ${accent}15)`,
            borderColor: `${accent}25`,
            color: accent,
          }}
        >
          {icon}
        </div>
      </div>

      <h3
        className="text-base font-semibold font-[family-name:var(--font-mono)] tracking-tight mb-1.5"
        style={{ color: accent }}
      >
        {title}
      </h3>
      <p className="text-xs text-gray-500 max-w-xs text-center leading-relaxed mb-6">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
