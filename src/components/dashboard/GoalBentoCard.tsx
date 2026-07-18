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
        <div
          className="h-7 w-7 rounded-lg flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(0, 212, 255, 0.03))",
            border: "1px solid rgba(0, 212, 255, 0.1)",
          }}
        >
          <Target className="h-3.5 w-3.5 text-[#00d4ff]" style={{ filter: "drop-shadow(0 0 3px rgba(0, 212, 255, 0.4))" }} strokeWidth={2.5} />
        </div>
        <h3 className="text-[11px] font-semibold text-gray-400 font-[family-name:var(--font-mono)] uppercase tracking-[0.15em]">
          Weekly Mission
        </h3>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="relative w-12 h-12">
          {/* Glow behind ring */}
          <div
            className="absolute inset-0 rounded-full glow-ring-pulse pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)",
            }}
          />
          <svg className="w-12 h-12 -rotate-90 relative z-10" viewBox="0 0 40 40">
            <circle
              cx="20" cy="20" r="18"
              fill="none"
              stroke="rgba(0, 212, 255, 0.06)"
              strokeWidth="3"
            />
            <motion.circle
              cx="20" cy="20" r="18"
              fill="none"
              stroke="url(#goalGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ filter: "drop-shadow(0 0 4px rgba(0, 212, 255, 0.4))" }}
            />
            <defs>
              <linearGradient id="goalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#00d4ff" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center z-20">
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
          background: "rgba(0, 212, 255, 0.06)",
          border: "1px solid rgba(0, 212, 255, 0.12)",
          boxShadow: "0 0 8px rgba(0, 212, 255, 0.06)",
        }}
      >
        <MessageCircle className="h-4 w-4 text-[#00d4ff]" strokeWidth={2.5} />
        {activeNudges.length > 0 && (
          <div
            className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #a855f7, #00d4ff)",
              boxShadow: "0 0 6px rgba(0, 212, 255, 0.4)",
            }}
          >
            <span className="text-[8px] font-bold text-white">
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
              background: "rgba(5, 8, 15, 0.95)",
              border: "1px solid rgba(0, 212, 255, 0.1)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 16px 48px rgba(0, 0, 0, 0.6), 0 0 24px rgba(0, 212, 255, 0.04)",
            }}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.03]">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full animate-pulse"
                  style={{ background: status.color, boxShadow: `0 0 6px ${status.color}60` }}
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
                          ? "rgba(0, 212, 255, 0.04)"
                          : "rgba(255, 255, 255, 0.015)",
                      border: `1px solid ${
                        nudge.priority === "high"
                          ? "rgba(0, 212, 255, 0.08)"
                          : "rgba(255, 255, 255, 0.025)"
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

            <div className="px-3 py-2 border-t border-white/[0.03]">
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
