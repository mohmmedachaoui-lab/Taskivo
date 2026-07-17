"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { calculateWinXP, calculatePenaltyXP, getRankTitle, calculateLevel } from "@/lib/xp-engine";
import { useAppStore } from "@/store";
import {
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Flame,
  Zap,
} from "lucide-react";

type Difficulty = "easy" | "medium" | "hard" | "extreme";

interface TaskItem {
  id: string;
  title: string;
  difficulty: Difficulty;
  completed: boolean;
  xp: number;
}

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; bg: string }> = {
  easy: { label: "Easy", color: "text-green-500", bg: "bg-green-500/10" },
  medium: { label: "Medium", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  hard: { label: "Hard", color: "text-orange-500", bg: "bg-orange-500/10" },
  extreme: { label: "Extreme", color: "text-red-500", bg: "bg-red-500/10" },
};

export default function TasksPage() {
  const { profile } = useAppStore();
  const level = profile ? calculateLevel(profile.totalXP) : 1;
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDiff, setNewDiff] = useState<Difficulty>("medium");

  const addTask = () => {
    if (!newTitle.trim()) return;
    const xp = calculateWinXP(newDiff, level);
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: newTitle,
        difficulty: newDiff,
        completed: false,
        xp,
      },
    ]);
    setNewTitle("");
    setShowAdd(false);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Complete tasks to earn XP
          </p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What do you need to do?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                />
                <div className="flex items-center gap-2">
                  {(["easy", "medium", "hard", "extreme"] as Difficulty[]).map(
                    (d) => (
                      <button
                        key={d}
                        onClick={() => setNewDiff(d)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          newDiff === d
                            ? `${DIFFICULTY_CONFIG[d].bg} ${DIFFICULTY_CONFIG[d].color}`
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                        }`}
                      >
                        {DIFFICULTY_CONFIG[d].label}
                      </button>
                    )
                  )}
                  <div className="ml-auto flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={addTask}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {tasks.length === 0 && (
          <Card className="text-center py-12">
            <Flame className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No tasks yet. Add one to start earning XP!
            </p>
          </Card>
        )}
        <AnimatePresence>
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                hover
                className={`flex items-center gap-4 ${
                  task.completed ? "opacity-60" : ""
                }`}
              >
                <button onClick={() => toggleTask(task.id)}>
                  {task.completed ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-300 dark:text-gray-700 hover:text-blue-500 transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium ${
                      task.completed
                        ? "line-through text-gray-400"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {task.title}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-lg ${DIFFICULTY_CONFIG[task.difficulty].bg} ${DIFFICULTY_CONFIG[task.difficulty].color}`}
                >
                  {DIFFICULTY_CONFIG[task.difficulty].label}
                </span>
                <span className="flex items-center gap-1 text-xs text-blue-500 font-medium">
                  <Zap className="h-3 w-3" />+{task.xp} XP
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
