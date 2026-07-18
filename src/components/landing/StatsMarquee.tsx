"use client";

import { Zap, Trophy, Swords, Users, Target, Flame, Crown, Shield } from "lucide-react";

const STATS = [
  { icon: Zap, label: "XP Earned", value: "2,847,391", color: "#00d4ff" },
  { icon: Trophy, label: "Achievements Unlocked", value: "184,209", color: "#facc15" },
  { icon: Swords, label: "Duels Fought", value: "92,481", color: "#ef4444" },
  { icon: Users, label: "Active Agents", value: "12,847", color: "#a855f7" },
  { icon: Target, label: "Tasks Completed", value: "1,203,847", color: "#10b981" },
  { icon: Flame, label: "Total Streak Days", value: "384,291", color: "#f97316" },
  { icon: Crown, label: "Guilds Formed", value: "4,821", color: "#facc15" },
  { icon: Shield, label: "Deep Mode Hours", value: "567,102", color: "#00d4ff" },
];

export default function StatsMarquee() {
  const items = [...STATS, ...STATS];

  return (
    <div className="relative overflow-hidden py-8">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-black to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-black to-transparent pointer-events-none" />

      <div className="marquee-track flex items-center gap-12 w-max">
        {items.map((stat, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-5 py-3 rounded-xl shrink-0"
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.04)",
            }}
          >
            <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
            <div>
              <p className="text-lg font-bold text-white font-[family-name:var(--font-mono)]">
                {stat.value}
              </p>
              <p className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)] uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
