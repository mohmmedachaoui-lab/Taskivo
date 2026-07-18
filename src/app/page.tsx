"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import GoogleSignIn from "@/components/auth/GoogleSignIn";
import ParticleBackground from "@/components/landing/ParticleBackground";
import LandingHero from "@/components/landing/LandingHero";
import FeatureShowcase from "@/components/landing/FeatureShowcase";
import StatsMarquee from "@/components/landing/StatsMarquee";
import FAQSection from "@/components/landing/FAQSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen" style={{ background: "#000000" }}>
      {/* Particle background */}
      <ParticleBackground />

      {/* Scan line */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute inset-0 scan-line h-32 bg-gradient-to-b from-transparent via-[#a855f7]/[0.015] to-transparent" />
      </div>

      {/* Sticky nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 px-8 py-5" style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255, 255, 255, 0.03)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#a855f7] to-[#00d4ff] flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text-glow font-[family-name:var(--font-mono)] tracking-tight">
              TASKIVO
            </span>
          </div>
          <GoogleSignIn />
        </div>
      </nav>

      {/* Hero */}
      <LandingHero />

      {/* Stats Marquee */}
      <div className="section-divider" />
      <StatsMarquee />
      <div className="section-divider" />

      {/* Features */}
      <div id="features">
        <FeatureShowcase />
      </div>

      <div className="section-divider" />

      {/* FAQ */}
      <div id="faq">
        <FAQSection />
      </div>

      {/* Footer */}
      <div className="section-divider" />
      <LandingFooter />
    </div>
  );
}
