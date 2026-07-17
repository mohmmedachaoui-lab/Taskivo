"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Swords, Trophy, Shield, Zap, Crown } from "lucide-react";

const activeDuels = [
  {
    id: "1",
    opponent: "NeonStrike",
    opponentAvatar: "NS",
    myXP: 180,
    opponentXP: 145,
    maxXP: 300,
    timeLeft: "2h 15m",
    status: "winning",
  },
  {
    id: "2",
    opponent: "CyberWolf",
    opponentAvatar: "CW",
    myXP: 90,
    opponentXP: 120,
    maxXP: 300,
    timeLeft: "4h 30m",
    status: "losing",
  },
];

const leaderboard = [
  { rank: 1, name: "PhantomX", level: 42, xp: 12500, avatar: "PX" },
  { rank: 2, name: "NeonStrike", level: 38, xp: 11200, avatar: "NS" },
  { rank: 3, name: "You", level: 5, xp: 2500, avatar: "YU", isUser: true },
  { rank: 4, name: "CyberWolf", level: 31, xp: 9800, avatar: "CW" },
  { rank: 5, name: "ShadowByte", level: 28, xp: 8400, avatar: "SB" },
];

export default function DuelsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Swords className="h-8 w-8 text-red-500" />
            War Room
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Challenge others and prove your productivity
          </p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25">
          <Swords className="h-4 w-4" />
          New Duel
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          Active Duels
        </h2>
        <div className="space-y-4">
          {activeDuels.map((duel, i) => {
            const myPercent = (duel.myXP / duel.maxXP) * 100;
            const oppPercent = (duel.opponentXP / duel.maxXP) * 100;
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
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                        YU
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          You
                        </p>
                        <p className="text-xs text-blue-500">
                          {duel.myXP} XP
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold">
                      VS
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {duel.opponent}
                        </p>
                        <p className="text-xs text-orange-500">
                          {duel.opponentXP} XP
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-bold">
                        {duel.opponentAvatar}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${myPercent}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
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
                          transition={{ duration: 1, delay: 0.5 }}
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
                      className={`text-sm font-medium ${
                        duel.status === "winning"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {duel.status === "winning" ? "Leading" : "Behind"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {duel.timeLeft} remaining
                    </span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Leaderboard
        </h2>
        <Card>
          <div className="space-y-3">
            {leaderboard.map((entry, i) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                  entry.isUser
                    ? "bg-blue-500/5 border border-blue-500/20"
                    : ""
                }`}
              >
                <span
                  className={`w-8 text-center font-bold text-lg ${
                    entry.rank === 1
                      ? "text-yellow-500"
                      : entry.rank === 2
                      ? "text-gray-400"
                      : entry.rank === 3
                      ? "text-orange-500"
                      : "text-gray-500"
                  }`}
                >
                  {entry.rank === 1 ? "👑" : `#${entry.rank}`}
                </span>
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    entry.isUser
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {entry.avatar}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      entry.isUser
                        ? "text-blue-500"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {entry.name} {entry.isUser && "(You)"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Level {entry.level}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-purple-500">
                  <Zap className="h-3 w-3" />
                  {entry.xp.toLocaleString()} XP
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
