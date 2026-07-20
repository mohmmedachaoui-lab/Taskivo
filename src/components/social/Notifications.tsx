"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { Bell, Swords, UserPlus, Trophy, Check, Zap, AlertTriangle, Trash2 } from "lucide-react";
import { clsx } from "clsx";

const ICON_MAP: Record<string, typeof Bell> = {
  duel_request: Swords,
  duel_won: Trophy,
  duel_lost: Swords,
  friend_request: UserPlus,
  friend_accepted: Check,
  achievement: Trophy,
  xp_penalty: AlertTriangle,
  stake_won: Zap,
  stake_lost: AlertTriangle,
  guild_invite: Trophy,
};

const COLOR_MAP: Record<string, string> = {
  duel_request: "text-red-400 bg-red-500/10",
  duel_won: "text-emerald-400 bg-emerald-500/10",
  duel_lost: "text-orange-400 bg-orange-500/10",
  friend_request: "text-[#00d4ff] bg-[#00d4ff]/10",
  friend_accepted: "text-emerald-400 bg-emerald-500/10",
  achievement: "text-yellow-400 bg-yellow-500/10",
  xp_penalty: "text-red-400 bg-red-500/10",
  stake_won: "text-[#00d4ff] bg-[#00d4ff]/10",
  stake_lost: "text-red-400 bg-red-500/10",
  guild_invite: "text-blue-400 bg-blue-500/10",
};

function formatRelativeTime(ts: number, now: number): string {
  const diff = Math.max(0, now - ts);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Notifications() {
  const { user } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useRealtimeNotifications(user?.uid);
  const [showPanel, setShowPanel] = useState(false);
  const [clearing, setClearing] = useState(false);
  const now = useCurrentTime(60000);

  const handleClearAll = async () => {
    setClearing(true);
    await markAllRead();
    setClearing(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-gray-800 hover:border-[#00d4ff]/20 transition-all duration-200"
      >
        <Bell className="h-3.5 w-3.5 text-gray-500" />
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 text-[8px] text-white flex items-center justify-center font-bold font-[family-name:var(--font-mono)]"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto glass neon-border rounded-xl shadow-2xl z-50"
          >
            <div className="flex items-center justify-between p-3 border-b border-[#00d4ff]/10">
              <h3 className="text-xs font-semibold text-gray-400 font-[family-name:var(--font-mono)] uppercase tracking-widest">
                Alerts
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleClearAll}
                  disabled={clearing}
                  className="flex items-center gap-1 text-[10px] text-[#00d4ff] hover:text-[#00a8cc] font-[family-name:var(--font-mono)] transition-colors"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                  CLEAR ALL
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="py-10 px-4">
                <div className="relative mx-auto mb-3 w-12 h-12 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#00d4ff]/5 blur-xl" />
                  <div className="relative h-10 w-10 rounded-xl bg-[#00d4ff]/[0.04] border border-[#00d4ff]/10 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-[#00d4ff]/40" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-[family-name:var(--font-mono)] text-center">
                  NO ALERTS
                </p>
                <p className="text-[10px] text-gray-600 text-center mt-1">
                  You&apos;re all caught up
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#00d4ff]/5">
                {notifications.slice(0, 20).map((n) => {
                  const Icon = ICON_MAP[n.type] || Bell;
                  const colors = COLOR_MAP[n.type] || "text-gray-500 bg-white/[0.03]";
                  return (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={clsx(
                        "flex items-start gap-2.5 w-full p-3 text-left hover:bg-white/[0.02] transition-all",
                        !n.read && "bg-[#00d4ff]/[0.02]"
                      )}
                    >
                      <div className={clsx("p-1 rounded-md shrink-0", colors)}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-gray-300">{n.title}</p>
                        <p className="text-[10px] text-gray-500 truncate">{n.message}</p>
                        <p className="text-[9px] text-gray-600 mt-0.5 font-[family-name:var(--font-mono)]">
                          {formatRelativeTime(n.createdAt, now)}
                        </p>
                      </div>
                      {!n.read && (
                        <div className="h-1.5 w-1.5 rounded-full bg-[#00d4ff] shrink-0 mt-1.5 shadow-[0_0_6px_rgba(0,212,255,0.6)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
