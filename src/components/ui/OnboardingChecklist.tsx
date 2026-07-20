"use client";

import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store";
import { CheckCircle2, Circle, X, Sparkles } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    id: "first-task",
    label: "Create your first mission",
    description: "Head to Missions and add something to work on",
    href: "/tasks",
  },
  {
    id: "complete-task",
    label: "Complete a mission",
    description: "Check off a mission to earn XP",
    href: "/tasks",
  },
  {
    id: "find-friend",
    label: "Add a friend",
    description: "Search Social and connect with someone",
    href: "/friends",
  },
  {
    id: "join-guild",
    label: "Join a guild",
    description: "Find a team in Guilds to compete together",
    href: "/guilds",
  },
] as const;

export default memo(function OnboardingChecklist() {
  const { user } = useAuth();
  const stats = useAppStore(s => s.stats);
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (user) {
      const key = `onboarding-dismissed-${user.uid}`;
      setDismissed(localStorage.getItem(key) === "true");
    }
  }, [user]);

  const dismiss = () => {
    if (user) {
      localStorage.setItem(`onboarding-dismissed-${user.uid}`, "true");
    }
    setDismissed(true);
  };

  const tasksCompleted = stats?.tasksCompleted ?? 0;
  const completed = [
    false,
    tasksCompleted > 0,
    false,
    false,
  ];

  const doneCount = completed.filter(Boolean).length;
  const allDone = doneCount === STEPS.length;

  if (dismissed || allDone || !user) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
        >
          <div className="rounded-xl border border-[#a855f7]/15 bg-gradient-to-br from-[#a855f7]/[0.04] to-[#050508]/80 backdrop-blur-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#a855f7]" />
                <span className="text-xs font-semibold font-[family-name:var(--font-mono)] text-[#a855f7] uppercase tracking-wider">
                  Getting Started
                </span>
                <span className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)]">
                  {doneCount}/{STEPS.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={dismiss}
                  className="text-[10px] text-gray-600 hover:text-gray-400 font-[family-name:var(--font-mono)] uppercase tracking-wider transition-colors"
                >
                  Skip All
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-600 hover:text-gray-400 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="h-1 rounded-full bg-gray-800/60 mb-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(doneCount / STEPS.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#a855f7] to-[#00d4ff] rounded-full"
              />
            </div>

            <div className="space-y-1.5">
              {STEPS.map((step, i) => {
                const isFirstIncomplete = !completed[i] && completed.slice(0, i).every((c) => c);
                return (
                  <Link
                    key={step.id}
                    href={step.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      completed[i]
                        ? "opacity-50"
                        : isFirstIncomplete
                          ? "bg-[#a855f7]/[0.06] ring-1 ring-[#a855f7]/15"
                          : "hover:bg-white/[0.02]"
                    }`}
                  >
                  {completed[i] ? (
                    <CheckCircle2 className="h-4 w-4 text-[#10b981] flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-600 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-medium ${completed[i] ? "text-gray-500 line-through" : "text-gray-300"}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-gray-600 truncate">{step.description}</p>
                  </div>
                  {!completed[i] && (
                    <span className="text-[10px] text-[#a855f7]/60 font-[family-name:var(--font-mono)] uppercase">
                      Go →
                    </span>
                  )}
                </Link>
              );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
})
