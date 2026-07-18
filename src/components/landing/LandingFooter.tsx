"use client";

import { Zap } from "lucide-react";
import GoogleSignIn from "@/components/auth/GoogleSignIn";
import MagneticButton from "./MagneticButton";
import ScrollReveal from "./ScrollReveal";

export default function LandingFooter() {
  return (
    <footer className="relative py-20 px-8">
      {/* Final CTA */}
      <ScrollReveal>
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold font-[family-name:var(--font-mono)] mb-4">
            <span className="gradient-text-cyber">Ready to start?</span>
          </h2>
          <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
            Join thousands of agents already leveling up their productivity.
            Your first mission awaits.
          </p>
          <MagneticButton strength={0.15}>
            <GoogleSignIn />
          </MagneticButton>
        </div>
      </ScrollReveal>

      <div className="section-divider max-w-4xl mx-auto mb-12" />

      {/* Footer bottom */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#a855f7] to-[#00d4ff] flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white font-[family-name:var(--font-mono)] tracking-tight">
            TASKIVO
          </span>
        </div>

        <div className="flex items-center gap-8">
          <a href="#features" className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)] uppercase tracking-widest hover:text-white transition-colors">
            Features
          </a>
          <a href="#faq" className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)] uppercase tracking-widest hover:text-white transition-colors">
            FAQ
          </a>
        </div>

        <p className="text-[10px] text-gray-700 font-[family-name:var(--font-mono)] uppercase tracking-[0.2em]">
          Built for operators
        </p>
      </div>
    </footer>
  );
}
