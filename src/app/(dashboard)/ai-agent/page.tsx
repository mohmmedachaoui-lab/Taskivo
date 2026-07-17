"use client";

import { motion } from "framer-motion";
import { Sparkles, Bot, ArrowRight } from "lucide-react";
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
          className="h-24 w-24 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-cyan-400/25"
        >
          <Bot className="h-12 w-12 text-white" />
        </motion.div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          AI Agent
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Your personal AI productivity assistant is being crafted with care.
          It will help you optimize your workflow, suggest task strategies, and
          boost your XP gains.
        </p>

        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-500 dark:bg-cyan-900/50 dark:text-cyan-300 text-sm font-medium">
            Coming Soon
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-left space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            What to expect
          </h3>
          <ul className="space-y-3">
            {[
              "Smart task prioritization based on your XP potential",
              "Personalized productivity insights and recommendations",
              "Natural language task creation and management",
              "Automated guild competition strategies",
            ].map((feature, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400"
              >
                <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <Button variant="secondary" className="mt-8 gap-2" disabled>
          <Sparkles className="h-4 w-4" />
          Notify me when ready
        </Button>
      </motion.div>
    </div>
  );
}
