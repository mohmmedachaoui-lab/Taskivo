"use client";

import { motion } from "framer-motion";
import { Bot, ArrowRight, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";

export default function AIAgentPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
          className="h-20 w-20 rounded-xl bg-gradient-to-br from-[#00d4ff] to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#00d4ff]/20"
        >
          <Bot className="h-10 w-10 text-white" />
        </motion.div>

        <h1 className="text-3xl font-bold text-white mb-3 font-[family-name:var(--font-mono)]">
          AI Agent
        </h1>
        <p className="text-xs text-gray-500 mb-6 font-[family-name:var(--font-mono)] uppercase tracking-widest">
          Coming Soon
        </p>

        <div className="glass neon-border rounded-xl p-6 text-left space-y-3 corner-accent">
          <h3 className="text-xs font-semibold text-gray-400 font-[family-name:var(--font-mono)] uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[#00d4ff]" />
            What to expect
          </h3>
          {[
            "Smart task prioritization based on your XP potential",
            "Personalized productivity insights",
            "Natural language task creation",
            "Automated guild competition strategies",
          ].map((feature, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
              <ArrowRight className="h-3 w-3 text-[#00d4ff] mt-0.5 shrink-0" />
              {feature}
            </div>
          ))}
        </div>

        <Button variant="neon" className="mt-6" disabled>
          <Sparkles className="h-3.5 w-3.5 mr-2" />
          NOTIFY ME
        </Button>
      </motion.div>
    </div>
  );
}
