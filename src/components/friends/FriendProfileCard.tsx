"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store";
import { getUserProfile, getUserStatsForProfile, getOrCreateDirectConversation } from "@/lib/chat";
import { useChatStore } from "@/store";
import { calculateXPProgress, getRankTitle } from "@/lib/xp-engine";
import { X, MessageSquare, Swords, Trophy, Flame, Target } from "lucide-react";
import Button from "@/components/ui/Button";

interface FriendProfileCardProps {
  uid: string;
  onClose: () => void;
}

export default function FriendProfileCard({ uid, onClose }: FriendProfileCardProps) {
  const { user } = useAuth();
  const { profile } = useAppStore();
  const { setActiveConversation, setDrawerOpen } = useChatStore();
  const [data, setData] = useState<{ uid: string; callsign: string; friendCode: string; photoURL: string | null; level: number; totalXP: number } | null>(null);
  const [stats, setStats] = useState<{ tasksCompleted: number; duelsWon: number; currentStreak: number; achievements: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [p, s] = await Promise.all([getUserProfile(uid), getUserStatsForProfile(uid)]);
      setData(p);
      setStats(s);
      setLoading(false);
    };
    load();
  }, [uid]);

  const handleMessage = async () => {
    if (!user || !profile || !data) return;
    const convId = await getOrCreateDirectConversation(
      user.uid,
      profile.callsign,
      data.uid,
      data.callsign
    );
    setActiveConversation(convId);
    setDrawerOpen(true);
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#a855f7] border-t-transparent" />
      </div>
    );
  }

  if (!data) return null;

  const level = data.level ?? 1;
  const xpProgress = calculateXPProgress(data.totalXP);
  const rank = getRankTitle(level);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-[60]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto z-[60] glass neon-border rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white font-[family-name:var(--font-mono)]">
            Agent Profile
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#6b21a8] flex items-center justify-center shadow-lg shadow-[#a855f7]/20">
            {data.photoURL ? (
              <img src={data.photoURL} alt={data.callsign} className="h-14 w-14 rounded-2xl object-cover" />
            ) : (
              <span className="text-white font-bold text-xl">{data.callsign[0]?.toUpperCase()}</span>
            )}
          </div>
          <div>
            <p className="text-base font-bold text-white">{data.callsign}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#a855f7]/10 text-[#a855f7] font-[family-name:var(--font-mono)]">
                Lvl {level}
              </span>
              <span className="text-[10px] text-gray-500 font-[family-name:var(--font-mono)]">
                {rank}
              </span>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-500 font-[family-name:var(--font-mono)]">
              {data.totalXP.toLocaleString()} XP
            </span>
            <span className="text-[10px] text-[#a855f7] font-[family-name:var(--font-mono)]">
              {Math.round(xpProgress)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-800/60 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#a855f7] to-[#6b21a8] rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02]">
              <Target className="h-3.5 w-3.5 text-[#10b981]" />
              <span className="text-xs text-gray-300">{stats.tasksCompleted} tasks</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02]">
              <Swords className="h-3.5 w-3.5 text-[#ef4444]" />
              <span className="text-xs text-gray-300">{stats.duelsWon} duels won</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02]">
              <Flame className="h-3.5 w-3.5 text-[#f97316]" />
              <span className="text-xs text-gray-300">{stats.currentStreak}d streak</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02]">
              <Trophy className="h-3.5 w-3.5 text-[#facc15]" />
              <span className="text-xs text-gray-300">{stats.achievements.length} badges</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handleMessage} className="flex-1 gap-2">
            <MessageSquare className="h-3.5 w-3.5" />
            Message
          </Button>
          <Button variant="secondary" className="gap-2">
            <Swords className="h-3.5 w-3.5" />
            Duel
          </Button>
        </div>
      </motion.div>
    </>
  );
}
