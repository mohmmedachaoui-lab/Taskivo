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

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-gray-800"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#levelGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      {/* Glow behind */}
      <div
        className="absolute rounded-full opacity-20 blur-xl"
        style={{
          width: size * 0.6,
          height: size * 0.6,
          background: "radial-gradient(circle, #00d4ff, transparent)",
        }}
      />
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-white font-[family-name:var(--font-mono)]">
          {level}
        </span>
        <span className="text-[8px] text-gray-500 font-[family-name:var(--font-mono)] uppercase tracking-widest">
          LVL
        </span>
      </div>
    </div>
  );
}
