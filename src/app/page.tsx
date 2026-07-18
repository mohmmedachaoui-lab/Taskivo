"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import GoogleSignIn from "@/components/auth/GoogleSignIn";
import { motion } from "framer-motion";
import { Zap, Target, Users, Trophy, Sparkles, Shield, Swords } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const features = [
    { icon: Target, title: "CYBER TASKS", desc: "Earn XP by completing tasks with precision" },
    { icon: Users, title: "GUILDS", desc: "Team up and compete on leaderboards" },
    { icon: Swords, title: "DUELS", desc: "High-stakes XP battles against friends" },
    { icon: Trophy, title: "ACHIEVEMENTS", desc: "Unlock badges for your milestones" },
    { icon: Shield, title: "DEEP MODE", desc: "Immersive focus with dimmed UI" },
    { icon: Sparkles, title: "AI AGENT", desc: "Coming soon — your productivity AI" },
  ];

  return (
    <div className="min-h-screen cyber-grid" style={{ background: "#020817" }}>
      {/* Scan line */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute inset-0 scan-line h-32 bg-gradient-to-b from-transparent via-[#00d4ff]/[0.02] to-transparent" />
      </div>

      <nav className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#00d4ff] to-blue-600 flex items-center justify-center shadow-lg shadow-[#00d4ff]/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold glow-neon-text text-[#00d4ff] font-[family-name:var(--font-mono)] tracking-tight">
            TASKIVO
          </span>
        </div>
        <GoogleSignIn />
      </nav>

      <main className="max-w-6xl mx-auto px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass neon-border text-[10px] text-[#00d4ff] font-[family-name:var(--font-mono)] uppercase tracking-widest mb-6">
            <div className="h-1.5 w-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
            System Online
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 font-[family-name:var(--font-mono)] tracking-tight">
            Productivity meets{" "}
            <span className="text-[#00d4ff] glow-neon-text">
              gaming
            </span>
          </h1>
          <p className="text-sm text-gray-500 max-w-xl mx-auto mb-10 font-[family-name:var(--font-mono)] leading-relaxed">
            Level up your life. Complete tasks, earn XP, climb ranks, and
            compete with friends in the ultimate cyber productivity platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <GoogleSignIn />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
              className="glass neon-border rounded-xl p-6 hover-glow corner-accent group"
            >
              <div className="h-10 w-10 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center mb-4 group-hover:bg-[#00d4ff]/20 transition-colors">
                <feat.icon className="h-5 w-5 text-[#00d4ff]" />
              </div>
              <h3 className="font-semibold text-white mb-1.5 text-sm font-[family-name:var(--font-mono)] tracking-wide">
                {feat.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom terminal line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-20 text-center"
        >
          <p className="text-[10px] text-gray-700 font-[family-name:var(--font-mono)] uppercase tracking-[0.3em]">
            Built for operators · Not for spectators
          </p>
        </motion.div>
      </main>
    </div>
  );
}
