"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store";
import { toggleStreakPause, applyStreakFreeze } from "@/lib/profiles";
import { getFreezesRemaining, getLocalDateString, calculateStreakUpdate } from "@/lib/streak";
import { doc, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Flame, Pause, Play, Snowflake } from "lucide-react";

const ACCENT = "#f97316";

export default function StreakCard() {
  const { user } = useAuth();
  const stats = useAppStore((s) => s.stats);
  const setStats = useAppStore((s) => s.setStats);
  const [toggling, setToggling] = useState(false);
  const [freezing, setFreezing] = useState(false);

  const streak = stats?.currentStreak ?? 0;
  const longest = stats?.longestStreak ?? 0;
  const paused = stats?.streakPaused ?? false;
  const freezesUsed = stats?.streakFreezesUsed ?? 0;
  const freezesLeft = getFreezesRemaining(freezesUsed);

  useEffect(() => {
    if (!user || !stats || stats.currentStreak === 0) return;
    const today = getLocalDateString();
    if (stats.lastActiveDate === today) return;
    if (stats.streakPaused) return;

    const result = calculateStreakUpdate(
      stats.currentStreak,
      stats.longestStreak,
      stats.lastActiveDate,
      false,
      today
    );

    if (result.streakJustReset) {
      if (stats) {
        setStats({ ...stats, currentStreak: result.currentStreak, longestStreak: result.longestStreak, lastActiveDate: result.lastActiveDate });
      }
      const db = getFirebaseDb();
      updateDoc(doc(db, "stats", user.uid), {
        currentStreak: result.currentStreak,
        longestStreak: result.longestStreak,
        lastActiveDate: result.lastActiveDate,
      }).catch(() => {});
    }
  }, [user, stats, setStats]);

  const handleTogglePause = useCallback(async () => {
    if (!user || toggling) return;
    setToggling(true);
    try {
      const newPaused = await toggleStreakPause(user.uid);
      if (stats) {
        setStats({ ...stats, streakPaused: newPaused });
      }
    } catch (err) {
      console.error("Failed to toggle streak pause:", err);
    }
    setToggling(false);
  }, [user, toggling, stats, setStats]);

  const handleFreeze = useCallback(async () => {
    if (!user || freezing || freezesLeft <= 0) return;
    setFreezing(true);
    try {
      const ok = await applyStreakFreeze(user.uid);
      if (ok && stats) {
        setStats({ ...stats, streakFreezesUsed: freezesUsed + 1 });
      }
    } catch (err) {
      console.error("Failed to apply freeze:", err);
    }
    setFreezing(false);
  }, [user, freezing, freezesLeft, freezesUsed, stats, setStats]);

  return (
    <div className="p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}15, ${ACCENT}05)`,
              border: `1px solid ${ACCENT}20`,
            }}
          >
            <Flame
              className="h-3.5 w-3.5"
              style={{ color: ACCENT, filter: `drop-shadow(0 0 4px ${ACCENT}60)` }}
              strokeWidth={2.5}
            />
          </div>
          <h3
            className="text-xs font-semibold font-[family-name:var(--font-mono)] uppercase tracking-[0.2em]"
            style={{ color: `${ACCENT}cc` }}
          >
            Streak
          </h3>
          {paused && (
            <span
              className="ml-auto text-[8px] font-[family-name:var(--font-mono)] px-1.5 py-0.5 rounded-full"
              style={{
                background: "rgba(148, 163, 184, 0.1)",
                color: "#94a3b8",
                border: "1px solid rgba(148, 163, 184, 0.2)",
              }}
            >
              PAUSED
            </span>
          )}
        </div>

        <div className="flex items-end gap-1 mb-1">
          <motion.span
            key={streak}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white font-[family-name:var(--font-mono)]"
          >
            {streak}
          </motion.span>
          <span className="text-xs text-gray-500 font-[family-name:var(--font-mono)] mb-1">
            days
          </span>
        </div>

        {longest > 0 && (
          <p className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)]">
            Best: {longest}d
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={handleTogglePause}
          disabled={toggling}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-[family-name:var(--font-mono)] transition-all"
          style={{
            background: paused ? `${ACCENT}10` : "rgba(148, 163, 184, 0.06)",
            border: `1px solid ${paused ? `${ACCENT}25` : "rgba(148, 163, 184, 0.12)"}`,
            color: paused ? ACCENT : "#94a3b8",
          }}
        >
          {paused ? (
            <Play className="h-3 w-3" />
          ) : (
            <Pause className="h-3 w-3" />
          )}
          {paused ? "Resume" : "Pause"}
        </button>

        {streak > 0 && (
          <button
            onClick={handleFreeze}
            disabled={freezing || freezesLeft <= 0}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-[family-name:var(--font-mono)] transition-all"
            style={{
              background: freezesLeft > 0 ? "rgba(0, 212, 255, 0.06)" : "rgba(148, 163, 184, 0.04)",
              border: `1px solid ${freezesLeft > 0 ? "rgba(0, 212, 255, 0.15)" : "rgba(148, 163, 184, 0.08)"}`,
              color: freezesLeft > 0 ? "#00d4ff" : "#475569",
              opacity: freezesLeft > 0 ? 1 : 0.5,
            }}
          >
            <Snowflake className="h-3 w-3" />
            Freeze ({freezesLeft})
          </button>
        )}
      </div>
    </div>
  );
}
