"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Zap, AlarmClock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import FocusTimer from "@/components/gamification/FocusTimer";
import { DashTaskItem } from "@/components/dashboard/DashboardListItems";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

type Tab = "missions" | "focus" | "alarm";

const TABS: { id: Tab; label: string; icon: typeof Target; color: string }[] = [
  { id: "missions", label: "Missions", icon: Target, color: "#facc15" },
  { id: "focus", label: "Focus", icon: Zap, color: "#00d4ff" },
  { id: "alarm", label: "Alarm", icon: AlarmClock, color: "#f97316" },
];

interface Alarm {
  id: string;
  time: string;
  label: string;
  active: boolean;
  days: string[];
  difficulty: "easy" | "medium" | "hard";
}

function AlarmsPanel({ uid }: { uid: string }) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(getFirebaseDb(), "alarms"),
      where("uid", "==", uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      setAlarms(
        snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Alarm[]
      );
    });
    return () => unsub();
  }, [uid]);

  const toggleAlarm = async (id: string, current: boolean) => {
    await updateDoc(doc(getFirebaseDb(), "alarms", id), { active: !current });
  };

  if (alarms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 text-center">
        <AlarmClock className="h-8 w-8 text-gray-700 mb-2" />
        <p className="text-xs text-gray-500">No alarms set</p>
        <p className="text-[10px] text-gray-600 mt-1">
          Create one from the Alarm page
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alarms.map((alarm) => (
        <div
          key={alarm.id}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
            alarm.active
              ? "bg-white/[0.02] border border-white/[0.04]"
              : "opacity-50"
          }`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white font-[family-name:var(--font-mono)] tabular-nums">
                {alarm.time}
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)] ${
                  alarm.difficulty === "easy"
                    ? "bg-green-500/10 text-green-500"
                    : alarm.difficulty === "medium"
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                {alarm.difficulty}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 truncate">{alarm.label}</p>
          </div>
          <button
            onClick={() => toggleAlarm(alarm.id, alarm.active)}
            className={`relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0 ${
              alarm.active
                ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.3)]"
                : "bg-gray-700"
            }`}
            aria-pressed={alarm.active}
            aria-label={`Toggle alarm ${alarm.label}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                alarm.active ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function MissionControl() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("missions");
  const { tasks, loading: tasksLoading } = useTasks(user?.uid);

  const activeTasks = tasks.filter(
    (t) => !t.completed && !t.penalty
  );

  return (
    <div className="h-full flex flex-col">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-5 pt-4 pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold font-[family-name:var(--font-mono)] uppercase tracking-wider transition-colors ${
              activeTab === tab.id
                ? "text-white"
                : "text-gray-600 hover:text-gray-400"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="mc-tab-indicator"
                className="absolute inset-0 rounded-lg"
                style={{
                  background: `${tab.color}10`,
                  border: `1px solid ${tab.color}25`,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <tab.icon
                className="h-3 w-3"
                style={{
                  color: activeTab === tab.id ? tab.color : undefined,
                  filter:
                    activeTab === tab.id
                      ? `drop-shadow(0 0 3px ${tab.color}50)`
                      : undefined,
                }}
                strokeWidth={2.5}
              />
              {tab.label}
            </span>
          </button>
        ))}
        {activeTab === "missions" && activeTasks.length > 0 && (
          <span
            className="ml-auto text-[9px] font-[family-name:var(--font-mono)] px-1.5 py-0.5 rounded-full"
            style={{
              background: "rgba(250, 204, 21, 0.1)",
              color: "#facc15",
              border: "1px solid rgba(250, 204, 21, 0.2)",
            }}
          >
            {activeTasks.length}
          </span>
        )}
      </div>

      {/* Panels */}
      <div className="flex-1 overflow-y-auto min-h-0 px-5 pb-5">
        {/* Missions — conditional render to release useTasks listener */}
        {activeTab === "missions" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="missions"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-1.5"
            >
              {tasksLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-14 rounded-xl bg-white/[0.02] animate-pulse"
                    />
                  ))}
                </div>
              ) : activeTasks.length > 0 ? (
                activeTasks.slice(0, 8).map((task) => (
                  <DashTaskItem
                    key={task.id}
                    task={task}
                    onSelect={() => {}}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Target className="h-8 w-8 text-gray-700 mb-2" />
                  <p className="text-xs text-gray-500">
                    No active missions
                  </p>
                  <p className="text-[10px] text-gray-600 mt-1">
                    Create one from the Missions page
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Focus — always mounted, hidden via CSS to preserve timer state */}
        <div style={{ display: activeTab === "focus" ? "block" : "none" }}>
          <FocusTimer />
        </div>

        {/* Alarm — conditional render to release onSnapshot listener */}
        {activeTab === "alarm" && user && (
          <AnimatePresence mode="wait">
            <motion.div
              key="alarm"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              <AlarmsPanel uid={user.uid} />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
