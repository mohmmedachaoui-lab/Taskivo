"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { useRealtimeFeed } from "@/hooks/useRealtimeFeed";
import { useFriends } from "@/hooks/useFriends";
import { analyzeAgentData, AgentInsight, SuggestedTask } from "@/lib/aiAgent";
import { Sparkles, ChevronRight, Circle, Clock } from "lucide-react";

const ACCENT = "#ec4899";
const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-green-400",
  medium: "text-yellow-400",
  hard: "text-orange-400",
  extreme: "text-red-400",
};

export default function AIAgentCard() {
  const { user } = useAuth();
  const profile = useAppStore((s) => s.profile);
  const stats = useAppStore((s) => s.stats);
  const { tasks } = useTasks(user?.uid);
  const { friendUids } = useFriends(user?.uid);
  const { feed } = useRealtimeFeed(user?.uid, friendUids);

  const totalXP = profile?.totalXP ?? 0;

  const analysis = useMemo(() => {
    if (!stats && tasks.length === 0) return null;
    return analyzeAgentData(tasks, stats, totalXP, feed);
  }, [tasks, stats, totalXP, feed]);

  if (!analysis) {
    return (
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}15, ${ACCENT}05)`,
              border: `1px solid ${ACCENT}20`,
            }}
          >
            <Sparkles
              className="h-3.5 w-3.5"
              style={{ color: ACCENT, filter: `drop-shadow(0 0 4px ${ACCENT}60)` }}
              strokeWidth={2.5}
            />
          </div>
          <h3
            className="text-xs font-semibold font-[family-name:var(--font-mono)] uppercase tracking-[0.2em]"
            style={{ color: `${ACCENT}cc` }}
          >
            Agent
          </h3>
        </div>
        <div className="flex flex-col items-center py-8">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-8 w-8 mb-3" style={{ color: ACCENT }} />
          </motion.div>
          <p className="text-xs text-gray-500 font-[family-name:var(--font-mono)]">
            Agent is calibrating...
          </p>
          <p className="text-[10px] text-gray-600 mt-1">
            Complete some tasks to unlock insights
          </p>
        </div>
      </div>
    );
  }

  const topInsights = analysis.insights.slice(0, 2);
  const suggestedTask = analysis.suggestedOrder[0];

  return (
    <div className="p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="h-7 w-7 rounded-lg flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${ACCENT}15, ${ACCENT}05)`,
            border: `1px solid ${ACCENT}20`,
          }}
        >
          <Sparkles
            className="h-3.5 w-3.5"
            style={{ color: ACCENT, filter: `drop-shadow(0 0 4px ${ACCENT}60)` }}
            strokeWidth={2.5}
          />
        </div>
        <h3
          className="text-xs font-semibold font-[family-name:var(--font-mono)] uppercase tracking-[0.2em]"
          style={{ color: `${ACCENT}cc` }}
        >
          Agent
        </h3>
        <span
          className="ml-auto text-[8px] font-[family-name:var(--font-mono)] px-1.5 py-0.5 rounded-full"
          style={{
            background: `${ACCENT}15`,
            color: ACCENT,
            border: `1px solid ${ACCENT}25`,
          }}
        >
          ANALYZING
        </span>
      </div>

      <div className="flex-1 space-y-3 min-h-0 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {topInsights.map((insight, i) => (
            <InsightRow key={insight.id} insight={insight} index={i} />
          ))}
        </AnimatePresence>

        {suggestedTask && (
          <SuggestedNext task={suggestedTask} />
        )}
      </div>
    </div>
  );
}

function InsightRow({ insight, index }: { insight: AgentInsight; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="rounded-xl p-3"
      style={{
        background: `linear-gradient(135deg, ${insight.accent ?? ACCENT}08, transparent)`,
        border: `1px solid ${insight.accent ?? ACCENT}15`,
      }}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-sm mt-0.5 shrink-0">{insight.icon}</span>
        <div className="min-w-0">
          <p
            className="text-[11px] font-semibold font-[family-name:var(--font-mono)]"
            style={{ color: insight.accent ?? ACCENT }}
          >
            {insight.title}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
            {insight.message}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function SuggestedNext({ task }: { task: SuggestedTask }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className="rounded-xl p-3"
      style={{
        background: "linear-gradient(135deg, rgba(236, 72, 153, 0.06), transparent)",
        border: "1px solid rgba(236, 72, 153, 0.12)",
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <ChevronRight
          className="h-3 w-3"
          style={{ color: ACCENT }}
        />
        <p
          className="text-[10px] font-semibold font-[family-name:var(--font-mono)] uppercase tracking-wider"
          style={{ color: `${ACCENT}aa` }}
        >
          Suggested Next
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="shrink-0 mt-0.5">
          <Circle
            className="h-4 w-4"
            style={{ color: ACCENT, filter: `drop-shadow(0 0 3px ${ACCENT}40)` }}
            strokeWidth={2}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium text-white truncate">
            {task.task.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-[family-name:var(--font-mono)] ${DIFFICULTY_COLORS[task.task.difficulty] ?? "text-gray-400"}`}>
              {task.task.difficulty}
            </span>
            {task.task.deadline && (
              <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                <Clock className="h-2.5 w-2.5" />
                deadline
              </span>
            )}
            <span className="text-[10px] text-[#00d4ff] font-[family-name:var(--font-mono)]">
              +{task.task.xpAwarded} XP
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] text-gray-500 font-[family-name:var(--font-mono)]">
            score
          </p>
          <p
            className="text-[12px] font-bold font-[family-name:var(--font-mono)]"
            style={{ color: ACCENT }}
          >
            {task.score}
          </p>
        </div>
      </div>
      <p className="text-[10px] text-gray-500 mt-2 italic">
        {task.reason}
      </p>
    </motion.div>
  );
}
