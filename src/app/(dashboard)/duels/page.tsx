"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import {
  createDuel,
  acceptDuel,
  getUserDuels,
  getCompletedDuels,
  resolveDuel,
  searchUsers,
} from "@/lib/social";
import { Duel } from "@/types";
import { calculateDuelStake } from "@/lib/xp-engine";
import {
  Swords,
  Shield,
  Zap,
  Clock,
  Trophy,
  X,
  Search,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export default function DuelsPage() {
  const { user } = useAuth();
  const { profile } = useAppStore();
  const [duels, setDuels] = useState<Duel[]>([]);
  const [completedDuels, setCompletedDuels] = useState<Duel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChallenge, setShowChallenge] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<{ uid: string; callsign: string; totalXP: number }[]>([]);
  const [searching, setSearching] = useState(false);
  const [stakeMultiplier, setStakeMultiplier] = useState(5);

  const totalXP = profile?.totalXP ?? 0;
  const stakeXP = calculateDuelStake(totalXP, stakeMultiplier / 100);
  const now = useCurrentTime(60000);

  const loadDuels = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [active, completed] = await Promise.all([
        getUserDuels(user.uid),
        getCompletedDuels(user.uid),
      ]);
      const now = Date.now();
      for (const duel of active) {
        if (duel.status === "active" && duel.endTime < now) {
          await resolveDuel(duel.id);
        }
      }
      setDuels(active);
      setCompletedDuels(completed);
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

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    try {
      const results = await searchUsers(searchTerm);
      setSearchResults(results.filter((r) => r.uid !== user?.uid));
    } catch (err) {
      console.error("Search failed:", err);
    }
    setSearching(false);
  };

  const handleChallenge = async (opponent: { uid: string; callsign: string }) => {
    if (!user || !profile) return;
    await createDuel(user.uid, profile.callsign, opponent.uid, opponent.callsign, stakeXP);
    setShowChallenge(false);
    setSearchTerm("");
    setSearchResults([]);
    await loadDuels();
  };

  const getTimeLeft = (endTime: number) => {
    const diff = Math.max(0, endTime - now);
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

  const wins = completedDuels.filter((d) => d.winnerId === user?.uid).length;
  const losses = completedDuels.filter((d) => d.winnerId && d.winnerId !== user?.uid).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-mono)] tracking-tight"><span className="text-[#00d4ff]">&gt;</span> War Room</h1>
          <p className="text-gray-500 mt-0.5 text-xs font-[family-name:var(--font-mono)] uppercase tracking-widest">High-stakes duels — bet XP, prove your worth</p>
        </div>
        <Button onClick={() => setShowChallenge(!showChallenge)} className="gap-2">
          <Swords className="h-4 w-4" />
          Challenge
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <Trophy className="h-6 w-6 text-green-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{wins}</p>
          <p className="text-xs text-gray-500">Wins</p>
        </Card>
        <Card className="text-center">
          <X className="h-6 w-6 text-red-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{losses}</p>
          <p className="text-xs text-gray-500">Losses</p>
        </Card>
        <Card className="text-center">
          <AlertTriangle className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{stakeXP}</p>
          <p className="text-xs text-gray-500">Current Stake</p>
        </Card>
      </div>

      <AnimatePresence>
        {showChallenge && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">Challenge a Player</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    Stake: <span className="text-[#00d4ff] font-bold">{stakeXP} XP</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-800/50">
                  <span className="text-xs text-gray-500 whitespace-nowrap">Stake %</span>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={stakeMultiplier}
                    onChange={(e) => setStakeMultiplier(parseInt(e.target.value))}
                    className="flex-1 accent-[#00d4ff]"
                  />
                  <span className="text-xs text-[#00d4ff] font-medium w-8 text-right">{stakeMultiplier}%</span>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Search callsign..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={searching}>
                    {searching ? "..." : "Search"}
                  </Button>
                  <Button variant="ghost" onClick={() => { setShowChallenge(false); setSearchResults([]); }}>Cancel</Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((result) => (
                      <div key={result.uid} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#00d4ff] to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {result.callsign[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{result.callsign}</p>
                          <p className="text-xs text-gray-500">{(result.totalXP ?? 0).toLocaleString()} XP</p>
                        </div>
                        <Button size="sm" onClick={() => handleChallenge(result)} className="gap-1">
                          <Swords className="h-3 w-3" /> Challenge ({stakeXP} XP)
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#00d4ff]" />
          Active Duels
        </h2>
        {loading ? (
          <Card className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00d4ff] border-t-transparent" />
          </Card>
        ) : duels.length === 0 ? (
          <EmptyState
            icon={<Swords className="h-8 w-8" strokeWidth={2.5} />}
            title="No active duels"
            description="Step into the arena. Challenge another agent and stake your XP to prove your worth."
            accent="#ef4444"
            actionLabel="Challenge Someone"
            onAction={() => setShowChallenge(true)}
          />
        ) : (
          <div className="space-y-4">
            {duels.map((duel, i) => {
              const myXP = getMyXP(duel);
              const oppXP = getOpponentXP(duel);
              const maxXP = Math.max(myXP, oppXP, 100);
              const myPercent = (myXP / maxXP) * 100;
              const oppPercent = (oppXP / maxXP) * 100;
              const isWinning = myXP > oppXP;

              return (
                <motion.div
                  key={duel.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-red-500/10">
                        <AlertTriangle className="h-3 w-3 text-red-400" />
                        <span className="text-xs text-red-400 font-medium">Stake: {duel.stakeXP || 100} XP</span>
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {duel.endTime > now ? getTimeLeft(duel.endTime) : "Ended"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00d4ff] to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                          {profile?.callsign[0].toUpperCase() ?? "Y"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">You</p>
                          <p className="text-xs text-[#00d4ff]">{myXP} XP</p>
                        </div>
                      </div>

                      <div className="text-center px-4">
                        <div className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold mb-1">VS</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">{getOpponentName(duel)}</p>
                          <p className="text-xs text-orange-500">{oppXP} XP</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-bold">
                          {getOpponentName(duel)[0].toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${myPercent}%` }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-[#00d4ff] to-blue-500 rounded-full" />
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right">{Math.round(myPercent)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${oppPercent}%` }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right">{Math.round(oppPercent)}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <span className={`text-sm font-medium flex items-center gap-1 ${isWinning ? "text-green-500" : "text-red-500"}`}>
                        {isWinning ? <><TrendingUp className="h-4 w-4" /> Leading</> : <><TrendingDown className="h-4 w-4" /> Behind</>}
                      </span>
                      {duel.status === "active" && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Zap className="h-3 w-3 text-green-500" /> Live tracking
                        </span>
                      )}
                      {duel.status === "pending" && user?.uid === duel.opponentId && (
                        <Button size="sm" onClick={async () => { await acceptDuel(duel.id); loadDuels(); }}>
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

      {completedDuels.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Duel History
          </h2>
          <div className="space-y-2">
            {completedDuels.slice(0, 10).map((duel, i) => {
              const isWinner = duel.winnerId === user?.uid;
              const isDraw = duel.winnerId === null;
              return (
                <motion.div key={duel.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <Card className="flex items-center gap-4">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isWinner ? "bg-green-500/10" : isDraw ? "bg-gray-500/10" : "bg-red-500/10"}`}>
                      {isWinner ? <Trophy className="h-4 w-4 text-green-400" /> : isDraw ? <span className="text-gray-400 text-xs">=</span> : <X className="h-4 w-4 text-red-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        {isWinner ? "Won" : isDraw ? "Draw" : "Lost"} vs{" "}
                        <span className="font-medium">{user?.uid === duel.challengerId ? duel.opponentName : duel.challengerName}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(duel.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs font-medium ${isWinner ? "text-green-400" : isDraw ? "text-gray-400" : "text-red-400"}`}>
                      {isWinner ? "+" : ""}{isWinner ? (duel.stakeXP || 100) : isDraw ? "0" : `-${duel.stakeXP || 100}`} XP
                    </span>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
