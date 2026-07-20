"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Button from "./Button";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  accent?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  accent = "#00d4ff",
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: EmptyStateProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col items-center justify-center py-16 px-4"
    >
      {/* Cyber grid backdrop */}
      <div
        className="absolute inset-0 rounded-2xl opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${accent}15 1px, transparent 1px), linear-gradient(90deg, ${accent}15 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Scanning line */}
      {!reducedMotion && (
        <motion.div
          className="absolute left-0 right-0 h-px pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}40, transparent)`,
          }}
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Icon container with orbit ring */}
      <div className="relative mb-6">
        {/* Outer glow */}
        <div
          className="absolute -inset-6 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: accent }}
        />

        {/* Orbit ring */}
        {!reducedMotion && (
          <motion.div
            className="absolute -inset-4 rounded-full border pointer-events-none"
            style={{ borderColor: `${accent}15` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            {/* Orbiting dot */}
            <div
              className="absolute -top-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full"
              style={{ background: accent, boxShadow: `0 0 8px ${accent}80` }}
            />
          </motion.div>
        )}

        {/* Icon */}
        <motion.div
          animate={reducedMotion ? {} : { y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex h-20 w-20 items-center justify-center rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${accent}10, ${accent}05)`,
            border: `1px solid ${accent}25`,
            color: accent,
          }}
        >
          {/* Corner brackets */}
          <div
            className="absolute top-0 left-0 w-3 h-3 pointer-events-none"
            style={{ borderTop: `1px solid ${accent}50`, borderLeft: `1px solid ${accent}50` }}
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 pointer-events-none"
            style={{ borderBottom: `1px solid ${accent}50`, borderRight: `1px solid ${accent}50` }}
          />
          {icon}
        </motion.div>
      </div>

      {/* Title with accent underline */}
      <div className="relative mb-1.5">
        <h3
          className="text-sm font-bold font-[family-name:var(--font-mono)] tracking-tight"
          style={{ color: accent }}
        >
          {title}
        </h3>
        <div
          className="h-px w-12 mx-auto mt-1.5 rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }}
        />
      </div>

      <p className="text-xs text-gray-500 max-w-xs text-center leading-relaxed mb-6">
        {description}
      </p>

      {actionLabel && onAction && (
        <div className="flex items-center gap-2">
          <Button onClick={onAction} className="gap-2">
            {actionLabel}
          </Button>
          {secondaryLabel && onSecondary && (
            <Button variant="ghost" onClick={onSecondary} className="gap-2">
              {secondaryLabel}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
