"use client";

import TiltCard from "./TiltCard";
import ScrollReveal from "./ScrollReveal";
import { Target, Users, Swords, Trophy, Shield, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: Target,
    title: "Cyber Tasks",
    desc: "Break missions into subtasks. Each completion triggers an XP injection. Miss a deadline and the penalty engine deducts XP — every second counts.",
    gradient: "from-cyan-500/20 to-blue-600/20",
    borderColor: "rgba(0, 212, 255, 0.2)",
    iconColor: "#00d4ff",
    floatClass: "float-slow",
  },
  {
    icon: Swords,
    title: "XP Duels",
    desc: "Challenge any agent to a high-stakes XP battle. Set the stakes from 1–15% of your total. Winner takes all, loser bleeds XP.",
    gradient: "from-red-500/20 to-orange-600/20",
    borderColor: "rgba(239, 68, 68, 0.2)",
    iconColor: "#ef4444",
    floatClass: "float-slow-delayed",
  },
  {
    icon: Users,
    title: "Guilds",
    desc: "Create or join a guild. Climb the guild leaderboard, kick slackers, and dominate the global rankings together.",
    gradient: "from-purple-500/20 to-pink-600/20",
    borderColor: "rgba(168, 85, 247, 0.2)",
    iconColor: "#a855f7",
    floatClass: "float-slow-delayed-2",
  },
  {
    icon: Trophy,
    title: "Achievements",
    desc: "20 milestones across 7 categories. From first task to legend status — every unlock is a permanent mark of your dedication.",
    gradient: "from-yellow-500/20 to-amber-600/20",
    borderColor: "rgba(250, 204, 21, 0.2)",
    iconColor: "#facc15",
    floatClass: "float-slow",
  },
  {
    icon: Shield,
    title: "Deep Mode",
    desc: "Activate Deep Mode to dim all distractions. Only your active task glows. The cybernetic focus state for maximum flow.",
    gradient: "from-emerald-500/20 to-green-600/20",
    borderColor: "rgba(16, 185, 129, 0.2)",
    iconColor: "#10b981",
    floatClass: "float-slow-delayed",
  },
  {
    icon: Sparkles,
    title: "AI Agent",
    desc: "Your personal productivity AI. Analyzes patterns, suggests optimal task order, and predicts when you'll hit your next rank.",
    gradient: "from-pink-500/20 to-rose-600/20",
    borderColor: "rgba(236, 72, 153, 0.2)",
    iconColor: "#ec4899",
    floatClass: "float-slow-delayed-2",
  },
];

export default function FeatureShowcase() {
  return (
    <section className="relative py-24 px-8">
      {/* Background orbs */}
      <div className="glow-orb w-[500px] h-[500px] bg-purple-600/30 -top-40 -left-40" />
      <div className="glow-orb w-[400px] h-[400px] bg-[#00d4ff]/20 top-20 -right-32" />

      <div className="max-w-6xl mx-auto relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-[10px] text-[#a855f7] font-[family-name:var(--font-mono)] uppercase tracking-[0.4em] mb-3">
              System Modules
            </p>
            <h2 className="text-3xl lg:text-5xl font-bold font-[family-name:var(--font-mono)] mb-4">
              <span className="gradient-text-cyber">Everything you need</span>
            </h2>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              Six interconnected modules designed to transform your productivity into a competitive sport.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, i) => (
            <ScrollReveal key={feat.title} delay={i * 0.1}>
              <TiltCard
                className={`${feat.floatClass} rounded-2xl cursor-default`}
                glareColor={`${feat.iconColor}15`}
              >
                <div
                  className="p-7 rounded-2xl h-full"
                  style={{
                    background: "rgba(8, 12, 24, 0.8)",
                    border: `1px solid ${feat.borderColor}`,
                  }}
                >
                  {/* Icon */}
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: `${feat.iconColor}12` }}
                  >
                    <feat.icon className="h-6 w-6" style={{ color: feat.iconColor }} />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-2 font-[family-name:var(--font-mono)]">
                    {feat.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
