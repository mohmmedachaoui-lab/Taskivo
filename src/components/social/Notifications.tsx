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
import { Bell, Swords, UserPlus, Trophy, Check, X } from "lucide-react";
import { clsx } from "clsx";

const ICON_MAP: Record<string, typeof Bell> = {
  duel_request: Swords,
  duel_won: Trophy,
  duel_lost: Swords,
  friend_request: UserPlus,
  friend_accepted: Check,
};

const COLOR_MAP: Record<string, string> = {
  duel_request: "text-red-500 bg-red-500/10",
  duel_won: "text-green-500 bg-green-500/10",
  duel_lost: "text-orange-500 bg-orange-500/10",
  friend_request: "text-blue-500 bg-blue-500/10",
  friend_accepted: "text-green-500 bg-green-500/10",
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
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
      >
        <Bell className="h-5 w-5 text-gray-500" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
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
            className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 z-50"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unread > 0 && (
                <button
                  onClick={handleReadAll}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="h-8 w-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {notifications.slice(0, 20).map((n) => {
                  const Icon = ICON_MAP[n.type] || Bell;
                  const colors = COLOR_MAP[n.type] || "text-gray-500 bg-gray-100";
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleReadOne(n.id)}
                      className={clsx(
                        "flex items-start gap-3 w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all",
                        !n.read && "bg-blue-500/5"
                      )}
                    >
                      <div className={clsx("p-1.5 rounded-lg shrink-0", colors)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                      {!n.read && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-2" />
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
