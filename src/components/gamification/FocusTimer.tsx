"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, Zap } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type Mode = "work" | "break";

const MODES = {
  work: { duration: 25 * 60, label: "Deep Work", color: "from-blue-500 to-purple-600" },
  break: { duration: 5 * 60, label: "Break", color: "from-green-500 to-emerald-600" },
};

export default function FocusTimer() {
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
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

  const switchMode = useCallback(
    (newMode: Mode) => {
      setIsRunning(false);
      setMode(newMode);
      setTimeLeft(MODES[newMode].duration);
    },
    []
  );

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (mode === "work") {
        setSessions((prev) => prev + 1);
        switchMode("break");
      } else {
        switchMode("work");
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, mode, switchMode]);

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
          Deep work sessions with Pomodoro technique
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
              stroke="url(#timerGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5 }}
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
          <Button
            variant="ghost"
            size="lg"
            onClick={reset}
            className="rounded-full p-3"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button
            size="lg"
            onClick={toggle}
            className={`rounded-full px-8 py-3 bg-gradient-to-r ${MODES[mode].color} text-white shadow-lg`}
          >
            {isRunning ? (
              <Pause className="h-5 w-5 mr-2" />
            ) : (
              <Play className="h-5 w-5 mr-2" />
            )}
            {isRunning ? "Pause" : "Start"}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-blue-500">{sessions}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sessions</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-purple-500">
            {sessions * 25}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Minutes</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-green-500">
            {sessions * 50}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">XP Earned</p>
        </Card>
      </div>
    </div>
  );
}
