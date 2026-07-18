"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { getGlobalLeaderboard, getFriends } from "@/lib/social";
import { getPublicProfiles } from "@/lib/profiles";
import { Crown, Users, Zap } from "lucide-react";
import { clsx } from "clsx";

interface LeaderboardEntry {
  uid: string;
  callsign: string;
  photoURL: string | null;
  level: number;
  totalXP: number;
  isUser?: boolean;
}

type ViewMode = "global" | "friends";

export default function Leaderboard({ friendUids }: { friendUids?: string[] }) {
  const { user } = useAuth();
  const [mode, setMode] = useState<ViewMode>("global");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGlobal = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getGlobalLeaderboard(50);
      setEntries(
        data.map((e) => ({ ...e, isUser: e.uid === user?.uid }))
      );
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    }
    setLoading(false);
  }, [user]);

  const loadFriends = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const friendIds = friendUids ?? (await getFriends(user.uid));
      const allIds = [user.uid, ...friendIds];
      const profiles = await getPublicProfiles(allIds);
      const sorted = profiles
        .map((p) => ({
          uid: p.uid,
          callsign: p.callsign,
          photoURL: p.photoURL,
          level: p.level,
          totalXP: p.totalXP,
          isUser: p.uid === user?.uid,
        }))
        .sort((a, b) => b.totalXP - a.totalXP);
      setEntries(sorted);
    } catch (err) {
      console.error("Failed to load friends leaderboard:", err);
    }
    setLoading(false);
  }, [user, friendUids]);

  useEffect(() => {
    if (mode === "global") {
      void loadGlobal();
    } else {
      void loadFriends();
    }
  }, [mode, loadGlobal, loadFriends]);

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-orange-500";
    return "text-gray-500";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Leaderboard
        </h2>
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
          <button
            onClick={() => setMode("global")}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              mode === "global"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            Global
          </button>
          <button
            onClick={() => setMode("friends")}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              mode === "friends"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            Friends
          </button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-10 w-10 text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {mode === "friends"
                ? "Add friends to see the leaderboard"
                : "No data yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.uid}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={clsx(
                  "flex items-center gap-4 px-5 py-3 transition-all",
                  entry.isUser &&
                    "bg-blue-500/5 border-l-2 border-l-blue-500"
                )}
              >
                <span
                  className={clsx("w-8 text-center font-bold text-lg", getRankStyle(i + 1))}
                >
                  {i < 3 ? ["👑", "🥈", "🥉"][i] : `#${i + 1}`}
                </span>
                <div
                  className={clsx(
                    "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                    entry.isUser
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  )}
                >
                  {entry.callsign[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={clsx(
                      "font-medium truncate",
                      entry.isUser
                        ? "text-blue-500"
                        : "text-gray-900 dark:text-white"
                    )}
                  >
                    {entry.callsign}
                    {entry.isUser && " (You)"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Level {entry.level}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-cyan-400">
                  <Zap className="h-3 w-3" />
                  {entry.totalXP.toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
