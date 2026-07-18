"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, Zap, Flame, Trophy } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store";
import { doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { calculateWinXP } from "@/lib/xp-engine";
import { addActivityFeedItem } from "@/lib/social";
import { incrementPublicXP } from "@/lib/profiles";

type Mode = "work" | "break";

const MODES = {
  work: { duration: 25 * 60, label: "DEEP WORK", color: "from-[#00d4ff] to-blue-600" },
  break: { duration: 5 * 60, label: "BREAK", color: "from-emerald-500 to-green-600" },
};

const XP_PER_SESSION = 50;

export default function FocusTimer() {
  const { user } = useAuth();
  const { profile, setProfile } = useAppStore();
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

      await updateDoc(userRef, { totalXP: increment(totalEarned) });
      await updateDoc(statsRef, { totalXP: increment(totalEarned) });
      await incrementPublicXP(user.uid, totalEarned);

      setTotalXP((prev) => prev + totalEarned);

      if (profile) {
        setProfile({ ...profile, totalXP: profile.totalXP + totalEarned });
        await addActivityFeedItem(
          user.uid,
          profile.callsign,
          "task_completed",
          `Completed a focus session (+${totalEarned} XP)`,
          totalEarned
        );
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
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-mono)] tracking-tight">
          <span className="text-[#00d4ff]">&gt;</span> Focus Mode
        </h1>
        <p className="text-gray-500 mt-0.5 text-xs font-[family-name:var(--font-mono)] uppercase tracking-widest">
          Pomodoro sessions that earn XP
        </p>
      </div>

      <div className="glass neon-border rounded-xl flex flex-col items-center py-10 corner-accent">
        {/* Mode Switcher */}
        <div className="flex gap-1 mb-10 p-1 rounded-lg bg-white/[0.02] border border-gray-800">
          {(["work", "break"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-[family-name:var(--font-mono)] uppercase tracking-wider transition-all duration-300 ${
                mode === m
                  ? m === "work"
                    ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 glow-neon"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "text-gray-600 hover:text-gray-400 border border-transparent"
              }`}
            >
              {m === "work" ? <Zap className="h-3.5 w-3.5" /> : <Coffee className="h-3.5 w-3.5" />}
              {MODES[m].label}
            </button>
          ))}
        </div>

        {/* Timer Ring */}
        <div className="relative mb-10">
          <svg width={260} height={260} className="-rotate-90">
            <circle
              cx={130}
              cy={130}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-gray-800/50"
            />
            <motion.circle
              cx={130}
              cy={130}
              r={radius}
              fill="none"
              stroke="url(#focusGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5 }}
            />
            <defs>
              <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={mode === "work" ? "#00d4ff" : "#10b981"} />
                <stop offset="100%" stopColor={mode === "work" ? "#3b82f6" : "#22c55e"} />
              </linearGradient>
            </defs>
          </svg>
          {/* Glow */}
          <div
            className="absolute inset-0 rounded-full opacity-10 blur-2xl"
            style={{
              background: `radial-gradient(circle, ${mode === "work" ? "#00d4ff" : "#10b981"}, transparent)`,
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold tabular-nums text-white font-[family-name:var(--font-mono)] tracking-tighter">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-gray-500 font-[family-name:var(--font-mono)] uppercase tracking-widest mt-1">
              {MODES[mode].label}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="lg" onClick={reset} className="rounded-full p-3">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            onClick={toggle}
            variant="neon"
            className="rounded-full px-10 py-3"
          >
            {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isRunning ? "PAUSE" : "START"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Flame, value: sessions, label: "SESSIONS", color: "text-[#00d4ff]" },
          { icon: Trophy, value: `${sessions * 25}m`, label: "FOCUS TIME", color: "text-emerald-400" },
          { icon: Zap, value: `+${totalXP}`, label: "XP EARNED", color: "text-yellow-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass neon-border rounded-xl text-center p-4">
            <stat.icon className={`h-4 w-4 ${stat.color} mx-auto mb-2`} />
            <p className="text-xl font-bold text-white font-[family-name:var(--font-mono)]">{stat.value}</p>
            <p className="text-[9px] text-gray-600 font-[family-name:var(--font-mono)] uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Session Complete Modal */}
      {showComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="glass neon-border rounded-xl max-w-sm w-full mx-4 text-center py-8 px-6 corner-accent"
          >
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-xl font-bold text-white font-[family-name:var(--font-mono)] mb-2">
              SESSION COMPLETE
            </h2>
            <p className="text-xs text-gray-500 font-[family-name:var(--font-mono)]">
              +{XP_PER_SESSION} BASE XP
            </p>
            <p className="text-xs text-[#00d4ff] font-[family-name:var(--font-mono)] mt-1">
              🔥 {streak} SESSION STREAK
            </p>
            <div className="mt-6">
              <Button onClick={() => { setShowComplete(false); switchMode("break"); }} variant="neon">
                START BREAK
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
