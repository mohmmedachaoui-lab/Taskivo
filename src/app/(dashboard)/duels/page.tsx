"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store";
import {
  createDuel,
  acceptDuel,
  getUserDuels,
  updateDuelXP,
  resolveDuel,
} from "@/lib/social";
import { Duel } from "@/types";
import { Swords, Shield, Crown, Zap, Clock, Trophy, X } from "lucide-react";

export default function DuelsPage() {
  const { user } = useAuth();
  const { profile } = useAppStore();
  const [duels, setDuels] = useState<Duel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDuels = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserDuels(user.uid);
      const now = Date.now();
      for (const duel of data) {
        if (duel.status === "active" && duel.endTime < now) {
          await resolveDuel(duel.id);
        }
      }
      setDuels(data);
    } catch (err) {
      console.error("Failed to load duels:", err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadDuels();
    const interval = setInterval(loadDuels, 10000);
    return () => clearInterval(interval);
  }, [loadDuels]);

  const getTimeLeft = (endTime: number) => {
    const diff = Math.max(0, endTime - Date.now());
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getOpponentName = (duel: Duel) => {
    if (!user) return "";
    return user.uid === duel.challengerId ? duel.opponentName : duel.challengerName;
  };

  const getMyXP = (duel: Duel) => {
    if (!user) return 0;
    return user.uid === duel.challengerId ? duel.challengerXP : duel.opponentXP;
  };

  const getOpponentXP = (duel: Duel) => {
    if (!user) return 0;
    return user.uid === duel.challengerId ? duel.opponentXP : duel.challengerXP;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Swords className="h-8 w-8 text-red-500" />
          War Room
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Challenge friends and track live XP progress
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          Active Duels
        </h2>
        {loading ? (
          <Card className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </Card>
        ) : duels.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-12">
            <Swords className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No active duels</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Challenge a friend from the Friends page
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {duels.map((duel, i) => {
              const myXP = getMyXP(duel);
              const oppXP = getOpponentXP(duel);
              const maxXP = Math.max(myXP, oppXP, 100);
              const myPercent = (myXP / maxXP) * 100;
              const oppPercent = (oppXP / maxXP) * 100;
              const isWinning = myXP > oppXP;
              const timeLeft = duel.endTime - Date.now();

              return (
                <motion.div
                  key={duel.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm font-bold">
                          {profile?.callsign[0].toUpperCase() ?? "Y"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            You
                          </p>
                          <p className="text-xs text-blue-500">{myXP} XP</p>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold mb-1">
                          VS
                        </div>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeLeft > 0 ? getTimeLeft(duel.endTime) : "Ended"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {getOpponentName(duel)}
                          </p>
                          <p className="text-xs text-orange-500">
                            {oppXP} XP
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-bold">
                          {getOpponentName(duel)[0].toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${myPercent}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right">
                          {Math.round(myPercent)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${oppPercent}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right">
                          {Math.round(oppPercent)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <span
                        className={`text-sm font-medium flex items-center gap-1 ${
                          duel.status === "completed"
                            ? duel.winnerId === user?.uid
                              ? "text-green-500"
                              : "text-red-500"
                            : isWinning
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {duel.status === "completed" ? (
                          duel.winnerId === user?.uid ? (
                            <><Trophy className="h-4 w-4" /> Victory</>
                          ) : duel.winnerId === null ? (
                            "Draw"
                          ) : (
                            <><X className="h-4 w-4" /> Defeat</>
                          )
                        ) : isWinning ? (
                          "Leading"
                        ) : (
                          "Behind"
                        )}
                      </span>
                      {duel.status === "active" && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Zap className="h-3 w-3 text-green-500" />
                          Live tracking
                        </span>
                      )}
                      {duel.status === "pending" && user?.uid === duel.opponentId && (
                        <Button
                          size="sm"
                          onClick={async () => {
                            await acceptDuel(duel.id);
                            loadDuels();
                          }}
                        >
                          Accept Duel
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
