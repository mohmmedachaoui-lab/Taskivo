"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, MessageCircle, X, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWeeklyGoals } from "@/hooks/useWeeklyGoals";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useAppStore } from "@/store";
import {
  generateNudges,
  getCompanionStatus,
  INITIAL_COMPANION_STATE,
} from "@/lib/companion";
import { CompanionState } from "@/types";

export default function GoalBentoCard() {
  const { user } = useAuth();
  const { profile, stats } = useAppStore();
  const { goals, setGoals, subscribeToGoals } = useWeeklyGoals(user?.uid);
  const [showCompanion, setShowCompanion] = useState(false);
  const [companion, setCompanion] = useState<CompanionState>(INITIAL_COMPANION_STATE);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToGoals((items) => setGoals(items));
    return () => unsub();
  }, [user?.uid, subscribeToGoals, setGoals]);

  const now = useCurrentTime(60000);
  const currentGoal = goals.find(
    (g) => g.weekStart <= now && g.weekEnd >= now && !g.completed
  );

  const progress = useMemo(() => {
    if (!currentGoal || currentGoal.tasks.length === 0) return 0;
    const total = currentGoal.tasks.reduce((s, t) => s + t.targetCount, 0);
    const done = currentGoal.tasks.reduce(
      (s, t) => s + Math.min(t.currentCount, t.targetCount),
      0
    );
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [currentGoal]);

  const status = getCompanionStatus(stats, companion);
  const activeNudges = companion.nudges.filter(
    (n) => !n.dismissed && !dismissedIds.has(n.id)
  );

  const handleCompanionOpen = () => {
    setShowCompanion(true);
    const nudges = generateNudges(profile, stats, companion, 0);
    if (nudges.length > 0) {
      setCompanion((prev) => ({
        ...prev,
        nudges: [...nudges, ...prev.nudges].slice(0, 10),
      }));
    }
  };

  const dismissNudge = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="p-4 h-full flex flex-col relative">
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-4 w-4 text-[#00d4ff]" strokeWidth={2.5} />
        <h3 className="text-[11px] font-semibold text-[#00d4ff]/80 font-[family-name:var(--font-mono)] uppercase tracking-[0.15em]">
          Weekly Mission
        </h3>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="relative w-12 h-12">
          <svg
            className="w-12 h-12 -rotate-90"
            viewBox="0 0 40 40"
          >
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="rgba(0, 212, 255, 0.08)"
              strokeWidth="3"
            />
            <motion.circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="#00d4ff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] font-bold text-white font-[family-name:var(--font-mono)]">
              {progress}%
            </span>
          </div>
        </div>

        {currentGoal ? (
          <div className="text-center">
            <p className="text-xs font-semibold text-white truncate max-w-full">
              {currentGoal.title}
            </p>
            <p className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)] mt-0.5">
              {currentGoal.tasks.filter((t) => t.completed).length}/
              {currentGoal.tasks.length} tasks
            </p>
          </div>
        ) : (
          <p className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)]">
            No mission set
          </p>
        )}
      </div>

      <button
        onClick={handleCompanionOpen}
        className="absolute bottom-3 right-3 h-8 w-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{
          background: `rgba(0, 212, 255, 0.08)`,
          border: `1px solid rgba(0, 212, 255, 0.15)`,
        }}
      >
        <MessageCircle className="h-4 w-4 text-[#00d4ff]" strokeWidth={2.5} />
        {activeNudges.length > 0 && (
          <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#00d4ff] flex items-center justify-center">
            <span className="text-[8px] font-bold text-black">
              {activeNudges.length}
            </span>
          </div>
        )}
      </button>

      <AnimatePresence>
        {showCompanion && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-2 w-64 companion-chat rounded-xl overflow-hidden z-50"
            style={{
              background: "rgba(5, 12, 25, 0.95)",
              border: "1px solid rgba(0, 212, 255, 0.15)",
              backdropFilter: "blur(16px)",
              boxShadow:
                "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 212, 255, 0.05)",
            }}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full animate-pulse"
                  style={{ background: status.color }}
                />
                <span className="text-[10px] font-semibold text-gray-300 font-[family-name:var(--font-mono)] uppercase tracking-wider">
                  {status.label}
                </span>
              </div>
              <button
                onClick={() => setShowCompanion(false)}
                className="text-gray-600 hover:text-gray-300 transition-colors"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>

            <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
              {activeNudges.length === 0 ? (
                <div className="py-4 text-center">
                  <Sparkles className="h-5 w-5 text-gray-700 mx-auto mb-2" strokeWidth={2} />
                  <p className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)]">
                    All quiet. Keep up the work.
                  </p>
                </div>
              ) : (
                activeNudges.map((nudge) => (
                  <motion.div
                    key={nudge.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-2 p-2 rounded-lg"
                    style={{
                      background:
                        nudge.priority === "high"
                          ? "rgba(0, 212, 255, 0.06)"
                          : "rgba(255, 255, 255, 0.02)",
                      border: `1px solid ${
                        nudge.priority === "high"
                          ? "rgba(0, 212, 255, 0.1)"
                          : "rgba(255, 255, 255, 0.03)"
                      }`,
                    }}
                  >
                    <span className="text-sm flex-shrink-0">{nudge.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-300 leading-relaxed">
                        {nudge.message}
                      </p>
                    </div>
                    <button
                      onClick={() => dismissNudge(nudge.id)}
                      className="text-gray-700 hover:text-gray-400 flex-shrink-0 transition-colors"
                    >
                      <X className="h-3 w-3" strokeWidth={2.5} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            <div className="px-3 py-2 border-t border-white/[0.04]">
              <p className="text-[9px] text-gray-600 font-[family-name:var(--font-mono)] text-center">
                {companion.sessionsToday} sessions today ·{" "}
                {companion.totalFocusMinutes}m total
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
