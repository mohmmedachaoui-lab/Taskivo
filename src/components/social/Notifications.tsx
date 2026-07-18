"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/social";
import { Notification } from "@/types";
import { Bell, Swords, UserPlus, Trophy, Check, Trophy as TrophyIcon, Zap, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";

const ICON_MAP: Record<string, typeof Bell> = {
  duel_request: Swords,
  duel_won: Trophy,
  duel_lost: Swords,
  friend_request: UserPlus,
  friend_accepted: Check,
  achievement: TrophyIcon,
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

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  const load = useCallback(async () => {
    if (!user) return;
    const data = await getNotifications(user.uid);
    setNotifications(data);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReadAll = async () => {
    if (!user) return;
    await markAllNotificationsRead(user.uid);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleReadOne = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-gray-800 hover:border-[#00d4ff]/20 transition-all duration-200"
      >
        <Bell className="h-3.5 w-3.5 text-gray-500" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 text-[8px] text-white flex items-center justify-center font-bold font-[family-name:var(--font-mono)]">
            {unread}
          </span>
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
              {unread > 0 && (
                <button
                  onClick={handleReadAll}
                  className="text-[10px] text-[#00d4ff] hover:text-[#00a8cc] font-[family-name:var(--font-mono)]"
                >
                  READ ALL
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="h-6 w-6 text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-600 font-[family-name:var(--font-mono)]">NO ALERTS</p>
              </div>
            ) : (
              <div className="divide-y divide-[#00d4ff]/5">
                {notifications.slice(0, 20).map((n) => {
                  const Icon = ICON_MAP[n.type] || Bell;
                  const colors = COLOR_MAP[n.type] || "text-gray-500 bg-white/[0.03]";
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleReadOne(n.id)}
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
                          {timeAgo(n.createdAt)}
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
