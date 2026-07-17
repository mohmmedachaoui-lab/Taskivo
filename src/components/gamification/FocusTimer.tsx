"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, Zap, Flame, Trophy } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store";
import { doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { calculateWinXP } from "@/lib/xp-engine";

type Mode = "work" | "break";

const MODES = {
  work: { duration: 25 * 60, label: "Deep Work", color: "from-blue-500 to-purple-600" },
  break: { duration: 5 * 60, label: "Break", color: "from-green-500 to-emerald-600" },
};

const XP_PER_SESSION = 50;

export default function FocusTimer() {
  const { user } = useAuth();
  const { profile, setProfile, setStats } = useAppStore();
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalTime = MODES[mode].duration;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const toggle = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(MODES[mode].duration);
  }, [mode]);

  const switchMode = useCallback((newMode: Mode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
  }, []);

  const saveSessionXP = useCallback(async () => {
    if (!user) return;
    try {
      const xpEarned = XP_PER_SESSION;
      const userRef = doc(getFirebaseDb(), "users", user.uid);
      const statsRef = doc(getFirebaseDb(), "stats", user.uid);

      const statsSnap = await getDoc(statsRef);
      const currentLevel = statsSnap.exists() ? statsSnap.data().level ?? 1 : 1;
      const bonusXP = calculateWinXP("medium", currentLevel);
      const totalEarned = xpEarned + bonusXP;

      await updateDoc(userRef, {
        totalXP: increment(totalEarned),
      });

      await updateDoc(statsRef, {
        totalXP: increment(totalEarned),
      });

      setTotalXP((prev) => prev + totalEarned);

      if (profile) {
        setProfile({ ...profile, totalXP: profile.totalXP + totalEarned });
      }
    } catch (err) {
      console.error("Failed to save XP:", err);
    }
  }, [user, profile, setProfile]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (mode === "work") {
        setSessions((prev) => prev + 1);
        setStreak((prev) => prev + 1);
        setShowComplete(true);
        saveSessionXP();
      } else {
        switchMode("work");
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, mode, switchMode, saveSessionXP]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Focus Mode
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Pomodoro sessions that earn you XP
        </p>
      </div>

      <Card className="flex flex-col items-center py-12">
        <div className="flex gap-2 mb-10">
          <button
            onClick={() => switchMode("work")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              mode === "work"
                ? "bg-blue-500/10 text-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Zap className="h-4 w-4" />
            Work
          </button>
          <button
            onClick={() => switchMode("break")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              mode === "break"
                ? "bg-green-500/10 text-green-500 shadow-[0_0_12px_rgba(34,197,94,0.2)]"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Coffee className="h-4 w-4" />
            Break
          </button>
        </div>

        <div className="relative mb-10">
          <svg width={240} height={240} className="-rotate-90">
            <circle
              cx={120}
              cy={120}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-gray-200 dark:text-gray-800"
            />
            <motion.circle
              cx={120}
              cy={120}
              r={radius}
              fill="none"
              stroke="url(#focusGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5 }}
            />
            <defs>
              <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={mode === "work" ? "#3b82f6" : "#22c55e"} />
                <stop offset="100%" stopColor={mode === "work" ? "#a855f7" : "#10b981"} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold tabular-nums text-gray-900 dark:text-white">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {MODES[mode].label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="lg" onClick={reset} className="rounded-full p-3">
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button
            size="lg"
            onClick={toggle}
            className={`rounded-full px-8 py-3 bg-gradient-to-r ${MODES[mode].color} text-white shadow-lg`}
          >
            {isRunning ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
            {isRunning ? "Pause" : "Start"}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="inline-flex p-2 rounded-xl bg-blue-500/10 mb-2">
            <Flame className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{sessions}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sessions</p>
        </Card>
        <Card className="text-center">
          <div className="inline-flex p-2 rounded-xl bg-purple-500/10 mb-2">
            <Trophy className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{sessions * 25}m</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Focus Time</p>
        </Card>
        <Card className="text-center">
          <div className="inline-flex p-2 rounded-xl bg-green-500/10 mb-2">
            <Zap className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">+{totalXP}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">XP Earned</p>
        </Card>
      </div>

      {showComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <Card className="max-w-sm w-full mx-4 text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-6xl mb-4"
            >
              🎯
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Session Complete!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              +{XP_PER_SESSION} base XP earned
            </p>
            <p className="text-sm text-green-500 font-medium mb-6">
              🔥 {streak} session streak!
            </p>
            <Button onClick={() => { setShowComplete(false); switchMode("break"); }}>
              Start Break
            </Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
