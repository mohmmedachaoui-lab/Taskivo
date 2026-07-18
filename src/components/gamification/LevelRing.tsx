"use client";

import { motion } from "framer-motion";

interface LevelRingProps {
  level: number;
  xpProgress: number;
  xpMax: number;
  size?: number;
}

export default function LevelRing({
  level,
  xpProgress,
  xpMax,
  size = 120,
}: LevelRingProps) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (xpProgress / xpMax) * circumference;
  const gradientId = `levelGrad-${size}`;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Outer glow aura */}
      <div
        className="absolute rounded-full glow-ring-pulse pointer-events-none"
        style={{
          width: size + 24,
          height: size + 24,
          background: `radial-gradient(circle, rgba(0, 212, 255, 0.12) 0%, rgba(59, 130, 246, 0.06) 40%, transparent 70%)`,
        }}
      />

      {/* Mid glow */}
      <div
        className="absolute rounded-full opacity-30 blur-xl pointer-events-none"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          background: "radial-gradient(circle, rgba(0, 212, 255, 0.4), transparent)",
        }}
      />

      <svg width={size} height={size} className="-rotate-90 relative z-10">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0, 212, 255, 0.06)"
          strokeWidth="5"
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ filter: "drop-shadow(0 0 6px rgba(0, 212, 255, 0.4))" }}
        />
        {/* Glow overlay */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          opacity={0.2}
          style={{ filter: "blur(4px)" }}
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="40%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#00d4ff" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute flex flex-col items-center z-20">
        <motion.span
          className="text-2xl font-bold text-white font-[family-name:var(--font-mono)]"
          style={{ textShadow: "0 0 12px rgba(0, 212, 255, 0.3)" }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
        >
          {level}
        </motion.span>
        <span className="text-[8px] text-[#00d4ff]/60 font-[family-name:var(--font-mono)] uppercase tracking-[0.2em]">
          LVL
        </span>
      </div>
    </div>
  );
}
