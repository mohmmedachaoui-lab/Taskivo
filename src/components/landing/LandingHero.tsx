"use client";

import { motion } from "framer-motion";
import { ChevronDown, Zap } from "lucide-react";
import GoogleSignIn from "@/components/auth/GoogleSignIn";
import MagneticButton from "./MagneticButton";

export default function LandingHero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-8">
      {/* Background orbs */}
      <div className="glow-orb w-[600px] h-[600px] bg-purple-700/25 -top-60 left-1/4" />
      <div className="glow-orb w-[500px] h-[500px] bg-[#00d4ff]/15 top-1/3 -right-40" />
      <div className="glow-orb w-[400px] h-[400px] bg-[#facc15]/10 -bottom-40 left-1/3" />

      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, rgba(168, 85, 247, 0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
          style={{
            background: "rgba(168, 85, 247, 0.08)",
            border: "1px solid rgba(168, 85, 247, 0.2)",
          }}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-[#a855f7] animate-pulse" />
          <span className="text-[10px] text-[#a855f7] font-[family-name:var(--font-mono)] uppercase tracking-[0.3em]">
            System Online
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-5xl sm:text-6xl lg:text-8xl font-bold font-[family-name:var(--font-mono)] tracking-tight mb-6 leading-[0.95]"
        >
          <span className="text-white">Productivity</span>
          <br />
          <span className="gradient-text-glow">meets gaming</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Level up your life. Complete tasks, earn XP, climb ranks, and
          compete with friends in the ultimate cyber productivity platform.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <MagneticButton strength={0.2}>
            <GoogleSignIn />
          </MagneticButton>
          <a
            href="#features"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-[family-name:var(--font-mono)] uppercase tracking-widest text-gray-500 hover:text-white transition-colors duration-300"
          >
            Explore Features
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 scroll-indicator"
      >
        <span className="text-[9px] text-gray-600 font-[family-name:var(--font-mono)] uppercase tracking-[0.3em]">
          Scroll Down
        </span>
        <ChevronDown className="h-4 w-4 text-gray-600" />
      </motion.div>
    </section>
  );
}
