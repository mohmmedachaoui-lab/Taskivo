"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useTasks } from "@/hooks/useTasks";
import {
  calculateWinXP,
  calculateMissedTaskPenalty,
  calculateLevel,
  checkAndUnlockAchievements,
} from "@/lib/xp-engine";
import { addActivityFeedItem } from "@/lib/social";
import { applyXPTransaction } from "@/lib/profiles";
import { requireOnline } from "@/lib/requireOnline";
import { doc, runTransaction, increment } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import EmptyState from "@/components/ui/EmptyState";
import {
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Flame,
  Zap,
  Clock,
  AlertTriangle,
  Calendar,
} from "lucide-react";

type Difficulty = "easy" | "medium" | "hard" | "extreme";

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; bg: string }> = {
  easy: { label: "Easy", color: "text-green-500", bg: "bg-green-500/10" },
  medium: { label: "Medium", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  hard: { label: "Hard", color: "text-orange-500", bg: "bg-orange-500/10" },
  extreme: { label: "Extreme", color: "text-red-500", bg: "bg-red-500/10" },
};

export default function TasksPage() {
  const { user } = useAuth();
  const profile = useAppStore(s => s.profile);
  const setProfile = useAppStore(s => s.setProfile);
  const level = profile ? calculateLevel(profile.totalXP) : 1;
  const { tasks, loading, addTask, toggleTask, deleteTask } = useTasks(user?.uid);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDiff, setNewDiff] = useState<Difficulty>("medium");
  const [deadlineDays, setDeadlineDays] = useState<number>(0);
  const [penaltyFlash, setPenaltyFlash] = useState<string | null>(null);
  const now = useCurrentTime(60000);

  const handleToggle = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task || task.completed || !user || !profile) {
        await toggleTask(id);
        return;
      }
      if (!requireOnline()) return;
      await toggleTask(id);

      const isEarlyBird = new Date().getHours() < 8;
      const { newTotalXP } = await applyXPTransaction(user.uid, task.xpAwarded, {
        tasksCompleted: increment(1),
        ...(isEarlyBird ? { earlyBirdTasks: increment(1) } : {}),
      });
      setProfile({ ...profile, totalXP: newTotalXP });

      await checkAndUnlockAchievements(user.uid);
      await addActivityFeedItem(
        user.uid,
        profile.callsign,
        "task_completed",
        `Completed "${task.title}" (+${task.xpAwarded} XP)`,
        task.xpAwarded
      );
    },
    [toggleTask, tasks, user, profile, setProfile]
  );

  const handleAdd = useCallback(async () => {
    if (!newTitle.trim()) return;
    if (!requireOnline()) return;
    const xp = calculateWinXP(newDiff, level);
    const deadline = deadlineDays > 0 ? now + deadlineDays * 24 * 60 * 60 * 1000 : null;
    await addTask(newTitle.trim(), newDiff, xp, deadline);
    setNewTitle("");
    setDeadlineDays(0);
    setShowAdd(false);
  }, [newTitle, newDiff, level, deadlineDays, now, addTask]);

  const handleDelete = useCallback(async (id: string) => {
    if (!requireOnline()) return;
    await deleteTask(id);
  }, [deleteTask]);

  const checkDeadlines = useCallback(async () => {
    const currentTime = Date.now();
    const db = getFirebaseDb();
    for (const task of tasks) {
      if (!task.completed && !task.penalty && task.deadline && task.deadline < currentTime) {
        if (!user || !profile) continue;
        try {
          const { newTotalXP } = await runTransaction(db, async (transaction) => {
            const taskRef = doc(db, "tasks", task.id);
            const taskSnap = await transaction.get(taskRef);
            if (!taskSnap.exists() || taskSnap.data().penalty) return { newTotalXP: profile.totalXP };

            const userRef = doc(db, "users", user.uid);
            const statsRef = doc(db, "stats", user.uid);
            const ppRef = doc(db, "publicProfiles", user.uid);
            const [userSnap, ppSnap] = await Promise.all([
              transaction.get(userRef),
              transaction.get(ppRef),
            ]);

            const penalty = calculateMissedTaskPenalty(task.difficulty, level);
            const currentXP = userSnap.data()?.totalXP ?? 0;
            const actualPenalty = Math.min(penalty, currentXP);
            const newXP = currentXP - actualPenalty;

            transaction.update(taskRef, { penalty: true });
            transaction.update(userRef, { totalXP: increment(-actualPenalty) });
            transaction.update(statsRef, {
              totalXP: increment(-actualPenalty),
              tasksFailed: increment(1),
              xpLost: increment(actualPenalty),
            });
            if (ppSnap.exists()) {
              transaction.update(ppRef, {
                totalXP: increment(-actualPenalty),
                level: calculateLevel(newXP),
              });
            }

            return { newTotalXP: newXP };
          });
          setPenaltyFlash(task.id);
          setTimeout(() => setPenaltyFlash(null), 3000);
          setProfile({ ...profile, totalXP: newTotalXP });
        } catch {
          // Transaction failed — task not penalized, will retry next loop
        }
      }
    }
  }, [tasks, user, profile, level, setProfile]);

  useEffect(() => {
    const interval = setInterval(checkDeadlines, 30000);
    checkDeadlines();
    return () => clearInterval(interval);
  }, [checkDeadlines]);

  const getTimeRemaining = (deadline: number) => {
    const diff = deadline - now;
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const activeTasks = tasks.filter((t) => !t.completed && !t.penalty);
  const completedTasks = tasks.filter((t) => t.completed);
  const failedTasks = tasks.filter((t) => t.penalty);
  const totalPenalty = failedTasks.reduce((sum, t) => sum + calculateMissedTaskPenalty(t.difficulty, level), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-mono)] tracking-tight">
            <span className="text-[#00d4ff]">&gt;</span> Tasks
          </h1>
          <p className="text-gray-500 mt-0.5 text-xs font-[family-name:var(--font-mono)] uppercase tracking-widest">
            Complete tasks to earn XP — miss deadlines and you lose XP
          </p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[72px] w-full" />
          ))}
        </div>
      )}

      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="space-y-8"
        >
          {failedTasks.length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-red-500/30 bg-red-500/5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-400">
                  {failedTasks.length} task{failedTasks.length > 1 ? "s" : ""} expired — XP penalty applied
                </p>
                <p className="text-xs text-red-400/60 mt-0.5">
                  Total lost: <span className="font-bold text-red-400">-{totalPenalty} XP</span>
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What do you need to do?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
                <div className="flex items-center gap-2">
                  {(["easy", "medium", "hard", "extreme"] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setNewDiff(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        newDiff === d ? `${DIFFICULTY_CONFIG[d].bg} ${DIFFICULTY_CONFIG[d].color}` : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                      }`}
                    >
                      {DIFFICULTY_CONFIG[d].label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500">Deadline:</span>
                  {[0, 1, 3, 7, 14].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDeadlineDays(d)}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                        deadlineDays === d
                          ? "bg-[#00d4ff]/10 text-[#00d4ff]"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {d === 0 ? "None" : `${d}d`}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAdd} disabled={!newTitle.trim()}>
                    Add ({calculateWinXP(newDiff, level)} XP)
                  </Button>
                  <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Active ({activeTasks.length})
          </h3>
          <div className="space-y-2">
            <AnimatePresence>
              {activeTasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card hover className={`flex items-center gap-4 ${penaltyFlash === task.id ? "border-red-500/50 bg-red-500/5" : ""}`}>
                    <button onClick={() => handleToggle(task.id)}>
                      <Circle className="h-6 w-6 text-gray-300 dark:text-gray-700 hover:text-[#00d4ff] transition-colors" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                      {task.deadline && (
                        <p className={`text-xs flex items-center gap-1 mt-0.5 ${
                          task.deadline - now < 3600000 ? "text-red-400" : "text-gray-500"
                        }`}>
                          <Clock className="h-3 w-3" />
                          {getTimeRemaining(task.deadline)}
                          {task.deadline - now < 3600000 && " — Due soon!"}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg ${DIFFICULTY_CONFIG[task.difficulty].bg} ${DIFFICULTY_CONFIG[task.difficulty].color}`}>
                      {DIFFICULTY_CONFIG[task.difficulty].label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#00d4ff] font-medium">
                      <Zap className="h-3 w-3" />+{task.xpAwarded} XP
                    </span>
                    <button onClick={() => handleDelete(task.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {failedTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-red-400/70 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" /> Expired ({failedTasks.length})
          </h3>
          <div className="space-y-2">
            {failedTasks.map((task) => (
              <Card key={task.id} className="flex items-center gap-4 opacity-60 border-red-500/20">
                <XIcon className="h-5 w-5 text-red-400" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-400 line-through truncate">{task.title}</p>
                </div>
                <span className="text-xs text-red-400 font-medium flex items-center gap-1">
                  <Zap className="h-3 w-3" />-{calculateMissedTaskPenalty(task.difficulty, level)} XP
                </span>
                <button onClick={() => handleDelete(task.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-green-400/70 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5" /> Completed ({completedTasks.length})
          </h3>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <Card key={task.id} className="flex items-center gap-4 opacity-60">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-400 line-through truncate">{task.title}</p>
                </div>
                <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                  <Zap className="h-3 w-3" />+{task.xpAwarded} XP
                </span>
                <button onClick={() => handleDelete(task.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <EmptyState
          icon={<Flame className="h-8 w-8" strokeWidth={2.5} />}
          title="No active missions"
          description="Your quest log is empty. Create a task to start earning XP and level up your agent."
          accent="#facc15"
          actionLabel="Create First Task"
          onAction={() => setShowAdd(true)}
        />
      )}
        </motion.div>
      )}
    </div>
  );
}

function XIcon(props: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}
