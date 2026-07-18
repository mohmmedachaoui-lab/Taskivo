"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Plus,
  Check,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useWeeklyGoals } from "@/hooks/useWeeklyGoals";
import { WeeklyGoal } from "@/types";

const SUGGESTED_TASKS = [
  "Complete 3 medium tasks",
  "2 focus sessions (25m each)",
  "Review and organize inbox",
  "Exercise for 30 minutes",
  "Read for 20 minutes",
  "No social media until 6pm",
  "Plan tomorrow's priorities",
  "Drink 8 glasses of water",
];

export default function WeeklyGoals() {
  const { user } = useAuth();
  const {
    goals,
    setGoals,
    loading,
    subscribeToGoals,
    createWeeklyGoal,
    addGoalTask,
    toggleGoalTask,
    deleteGoal,
    resetWeeklyGoal,
  } = useWeeklyGoals(user?.uid);

  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTarget, setNewTaskTarget] = useState(1);
  const [addingTaskTo, setAddingTaskTo] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToGoals((items) => setGoals(items));
    return () => unsub();
  }, [user?.uid, subscribeToGoals, setGoals]);

  const now = useCurrentTime(60000);
  const currentGoal = goals.find(
    (g) => g.weekStart <= now && g.weekEnd >= now && !g.completed
  );

  const handleCreateGoal = async () => {
    if (!newGoalTitle.trim()) return;
    const id = await createWeeklyGoal(newGoalTitle.trim());
    if (id) {
      setExpandedGoal(id);
      setShowNewGoal(false);
      setNewGoalTitle("");
    }
  };

  const handleAddTask = async (goalId: string) => {
    if (!newTaskTitle.trim()) return;
    await addGoalTask(goalId, newTaskTitle.trim(), newTaskTarget);
    setNewTaskTitle("");
    setNewTaskTarget(1);
    setAddingTaskTo(null);
  };

  const getGoalProgress = (goal: WeeklyGoal) => {
    if (goal.tasks.length === 0) return 0;
    const total = goal.tasks.reduce((s, t) => s + t.targetCount, 0);
    const done = goal.tasks.reduce(
      (s, t) => s + Math.min(t.currentCount, t.targetCount),
      0
    );
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const getWeekLabel = (start: number, end: number) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString("en", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en", { month: "short", day: "numeric" })}`;
  };

  if (loading) {
    return (
      <div className="p-5 h-full flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-4 w-4 text-[#00d4ff]" strokeWidth={2.5} />
        <h3 className="text-xs font-semibold text-[#00d4ff]/80 font-[family-name:var(--font-mono)] uppercase tracking-[0.2em]">
          Weekly Missions
        </h3>
      </div>

      {!currentGoal && !showNewGoal && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowNewGoal(true)}
          className="w-full py-4 rounded-xl border border-dashed border-[#00d4ff]/20 text-[#00d4ff]/60 text-xs font-[family-name:var(--font-mono)] uppercase tracking-wider hover:border-[#00d4ff]/40 hover:text-[#00d4ff] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          Set Weekly Mission
        </motion.button>
      )}

      <AnimatePresence mode="popLayout">
        {showNewGoal && (
          <motion.div
            key="new-goal"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl p-4 mb-3"
            style={{ border: "1px solid rgba(0, 212, 255, 0.15)" }}
          >
            <input
              type="text"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="Mission title (e.g. Dominate This Week)"
              className="w-full bg-transparent text-sm text-white placeholder-gray-600 outline-none mb-3 font-[family-name:var(--font-mono)]"
              onKeyDown={(e) => e.key === "Enter" && handleCreateGoal()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateGoal}
                className="flex-1 py-2 rounded-lg bg-[#00d4ff]/10 text-[#00d4ff] text-xs font-semibold hover:bg-[#00d4ff]/20 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewGoal(false);
                  setNewGoalTitle("");
                }}
                className="px-4 py-2 rounded-lg text-gray-500 text-xs hover:text-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {goals.slice(0, 3).map((goal) => {
          const progress = getGoalProgress(goal);
          const isExpanded = expandedGoal === goal.id;
          const isCurrent = goal.weekStart <= now && goal.weekEnd >= now;

          return (
            <motion.div
              key={goal.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-xl mb-2 overflow-hidden"
              style={{
                border: isCurrent
                  ? "1px solid rgba(0, 212, 255, 0.2)"
                  : "1px solid rgba(255, 255, 255, 0.04)",
              }}
            >
              <div
                onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                className="px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {goal.completed ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" strokeWidth={3} />
                    ) : isCurrent ? (
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-[#00d4ff] flex-shrink-0" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border border-gray-700 flex-shrink-0" />
                    )}
                    <p className="text-sm font-semibold text-white truncate">
                      {goal.title}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      style={{
                        background:
                          progress === 100
                            ? "linear-gradient(90deg, #10b981, #34d399)"
                            : "linear-gradient(90deg, #00d4ff, #3b82f6)",
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-[family-name:var(--font-mono)] text-gray-500 flex-shrink-0">
                    {progress}%
                  </span>
                </div>
                <p className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)] mt-1">
                  {getWeekLabel(goal.weekStart, goal.weekEnd)}
                </p>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 space-y-1.5">
                      {goal.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-2 group"
                        >
                          <button
                            onClick={() => toggleGoalTask(goal.id, task.id)}
                            className={`h-4 w-4 rounded flex-shrink-0 flex items-center justify-center transition-all ${
                              task.completed
                                ? "bg-[#00d4ff]/20 text-[#00d4ff]"
                                : "border border-gray-700 hover:border-[#00d4ff]/40"
                            }`}
                          >
                            {task.completed && (
                              <Check className="h-2.5 w-2.5" strokeWidth={3} />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs truncate ${
                                task.completed
                                  ? "text-gray-500 line-through"
                                  : "text-gray-300"
                              }`}
                            >
                              {task.title}
                            </p>
                          </div>
                          <span className="text-[10px] font-[family-name:var(--font-mono)] text-gray-600 flex-shrink-0">
                            {task.currentCount}/{task.targetCount}
                          </span>
                        </div>
                      ))}

                      {addingTaskTo === goal.id ? (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="pt-2 space-y-2"
                        >
                          <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Task description"
                            className="w-full bg-transparent text-xs text-white placeholder-gray-600 outline-none font-[family-name:var(--font-mono)]"
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleAddTask(goal.id)
                            }
                            autoFocus
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)]">
                              Repeat:
                            </span>
                            {[1, 2, 3, 5, 7].map((n) => (
                              <button
                                key={n}
                                onClick={() => setNewTaskTarget(n)}
                                className={`px-2 py-0.5 rounded text-[10px] font-[family-name:var(--font-mono)] transition-colors ${
                                  newTaskTarget === n
                                    ? "bg-[#00d4ff]/20 text-[#00d4ff]"
                                    : "text-gray-600 hover:text-gray-400"
                                }`}
                              >
                                {n}×
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddTask(goal.id)}
                              className="flex-1 py-1.5 rounded-lg bg-[#00d4ff]/10 text-[#00d4ff] text-[11px] font-semibold hover:bg-[#00d4ff]/20 transition-colors"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => {
                                setAddingTaskTo(null);
                                setNewTaskTitle("");
                              }}
                              className="px-3 py-1.5 rounded-lg text-gray-600 text-[11px] hover:text-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                          <div className="pt-1">
                            <button
                              onClick={() => setShowSuggestions(!showSuggestions)}
                              className="flex items-center gap-1 text-[10px] text-[#a855f7] font-[family-name:var(--font-mono)] hover:text-[#a855f7]/80"
                            >
                              <Sparkles className="h-3 w-3" strokeWidth={2.5} />
                              {showSuggestions ? "Hide" : "Suggestions"}
                            </button>
                            {showSuggestions && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="pt-1.5 flex flex-wrap gap-1"
                              >
                                {SUGGESTED_TASKS.map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => {
                                      setNewTaskTitle(s);
                                      setShowSuggestions(false);
                                    }}
                                    className="px-2 py-0.5 rounded-full text-[10px] text-gray-500 hover:text-[#a855f7] hover:bg-[#a855f7]/[0.06] transition-colors"
                                    style={{
                                      border:
                                        "1px solid rgba(168, 85, 247, 0.1)",
                                    }}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      ) : (
                        <button
                          onClick={() => setAddingTaskTo(goal.id)}
                          className="w-full py-2 rounded-lg border border-dashed border-white/[0.06] text-[11px] text-gray-600 hover:border-[#00d4ff]/20 hover:text-[#00d4ff]/60 transition-all flex items-center justify-center gap-1.5 mt-2"
                        >
                          <Plus className="h-3 w-3" strokeWidth={2.5} />
                          Add Task
                        </button>
                      )}

                      {goal.tasks.length > 0 && (
                        <div className="flex gap-2 pt-2">
                          {!isCurrent && (
                            <button
                              onClick={async () => {
                                const newId = await resetWeeklyGoal(goal.id);
                                if (newId) setExpandedGoal(newId);
                              }}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-gray-600 hover:text-[#00d4ff] hover:bg-[#00d4ff]/[0.04] transition-colors"
                            >
                              <RotateCcw className="h-3 w-3" strokeWidth={2.5} />
                              Repeat
                            </button>
                          )}
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-gray-600 hover:text-red-400 hover:bg-red-400/[0.04] transition-colors"
                          >
                            <Trash2 className="h-3 w-3" strokeWidth={2.5} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {goals.length === 0 && !showNewGoal && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[11px] text-gray-600 font-[family-name:var(--font-mono)]">
            No missions yet. Set your first weekly goal.
          </p>
        </div>
      )}
    </div>
  );
}
