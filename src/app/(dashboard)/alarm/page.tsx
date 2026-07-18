"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import MathChallenge from "@/components/ui/MathChallenge";
import { useAuth } from "@/hooks/useAuth";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { AlarmClock, Plus, Trash2, Clock, Settings2 } from "lucide-react";

type Difficulty = "easy" | "medium" | "hard";

interface Alarm {
  id: string;
  time: string;
  label: string;
  active: boolean;
  days: string[];
  difficulty: Difficulty;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function playAlarmTone(): OscillatorNode | null {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.setValueAtTime(600, ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    return osc;
  } catch {
    return null;
  }
}

export default function AlarmPage() {
  const { user } = useAuth();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTime, setNewTime] = useState("09:00");
  const [newLabel, setNewLabel] = useState("");
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>("medium");
  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(null);
  const [showChallenge, setShowChallenge] = useState(false);
  const oscRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(getFirebaseDb(), "alarms"),
      where("uid", "==", user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const items: Alarm[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Alarm[];
      setAlarms(items);
    });
    return () => unsub();
  }, [user]);

  const checkAlarms = useCallback(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const currentDay = DAYS[now.getDay() === 0 ? 6 : now.getDay() - 1];

    alarms.forEach((alarm) => {
      if (alarm.active && alarm.time === currentTime && alarm.days.includes(currentDay)) {
        if (!showChallenge) {
          setActiveAlarm(alarm);
          setShowChallenge(true);
        }
      }
    });
  }, [alarms, showChallenge]);

  useEffect(() => {
    const interval = setInterval(checkAlarms, 1000);
    return () => clearInterval(interval);
  }, [checkAlarms]);

  useEffect(() => {
    if (showChallenge) {
      oscRef.current = playAlarmTone();
    }
    return () => {
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch {}
        oscRef.current = null;
      }
    };
  }, [showChallenge]);

  const toggleAlarm = async (id: string, currentActive: boolean) => {
    if (!user) return;
    await updateDoc(doc(getFirebaseDb(), "alarms", id), { active: !currentActive });
  };

  const deleteAlarm = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(getFirebaseDb(), "alarms", id));
  };

  const addAlarm = async () => {
    if (!newLabel.trim() || !user) return;
    const ref = doc(collection(getFirebaseDb(), "alarms"));
    await setDoc(ref, {
      uid: user.uid,
      time: newTime,
      label: newLabel,
      active: true,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      difficulty: newDifficulty,
    });
    setNewLabel("");
    setShowAdd(false);
  };

  const dismissAlarm = () => {
    if (oscRef.current) {
      try { oscRef.current.stop(); } catch {}
      oscRef.current = null;
    }
    setShowChallenge(false);
    setActiveAlarm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-mono)] tracking-tight"><span className="text-[#00d4ff]">&gt;</span> Smart Alarm</h1>
          <p className="text-gray-500 mt-0.5 text-xs font-[family-name:var(--font-mono)] uppercase tracking-widest">Alarms with math challenges — solve to dismiss</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Alarm
        </Button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Time</label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Label</label>
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="e.g. Morning Focus"
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      onKeyDown={(e) => e.key === "Enter" && addAlarm()}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <Settings2 className="h-3.5 w-3.5 inline mr-1" />
                    Math Difficulty
                  </label>
                  <div className="flex gap-2">
                    {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => setNewDifficulty(d)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          newDifficulty === d
                            ? d === "easy"
                              ? "bg-green-500/10 text-green-500 ring-1 ring-green-500/30"
                              : d === "medium"
                              ? "bg-yellow-500/10 text-yellow-500 ring-1 ring-yellow-500/30"
                              : "bg-red-500/10 text-red-500 ring-1 ring-red-500/30"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      >
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {newDifficulty === "easy"
                      ? "Simple addition/subtraction (1-20)"
                      : newDifficulty === "medium"
                      ? "Mixed operations (10-50)"
                      : "All operations including division (10-100)"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={addAlarm}>
                    Add Alarm
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {alarms.length === 0 && !showAdd ? (
        <Card className="flex flex-col items-center justify-center py-12">
          <AlarmClock className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No alarms set</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Create an alarm — solve a math problem to dismiss it
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {alarms.map((alarm, i) => (
            <motion.div
              key={alarm.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`flex items-center gap-4 ${alarm.active ? "" : "opacity-50"}`}>
                <div className="flex items-center gap-3">
                  <Clock className={`h-5 w-5 ${alarm.active ? "text-blue-500" : "text-gray-400"}`} />
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                      {alarm.time}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{alarm.label}</p>
                  </div>
                </div>

                <div className="flex-1 flex justify-center gap-1">
                  {DAYS.map((day) => (
                    <span
                      key={day}
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        alarm.days.includes(day)
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                      }`}
                    >
                      {day}
                    </span>
                  ))}
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-lg font-medium ${
                    alarm.difficulty === "easy"
                      ? "bg-green-500/10 text-green-500"
                      : alarm.difficulty === "medium"
                      ? "bg-yellow-500/10 text-yellow-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {alarm.difficulty === "easy" ? "Easy Math" : alarm.difficulty === "medium" ? "Med Math" : "Hard Math"}
                </span>

                <button
                  onClick={() => toggleAlarm(alarm.id, alarm.active)}
                  className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                    alarm.active
                      ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      alarm.active ? "translate-x-6" : ""
                    }`}
                  />
                </button>

                <button
                  onClick={() => deleteAlarm(alarm.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showChallenge && activeAlarm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Card className="max-w-md w-full py-8">
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 rounded-2xl bg-red-500/10 mb-4">
                    <AlarmClock className="h-8 w-8 text-red-500 animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activeAlarm.label}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">{activeAlarm.time}</p>
                </div>

                <MathChallenge
                  difficulty={activeAlarm.difficulty}
                  onSolved={dismissAlarm}
                />
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
