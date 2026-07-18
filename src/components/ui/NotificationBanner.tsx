"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFCMNotifications } from "@/hooks/useFCMNotifications";
import { Bell, X } from "lucide-react";

export default function NotificationBanner() {
  const { supported, permission, requestPermission } = useFCMNotifications();
  const [dismissed, setDismissed] = useState(false);

  if (!supported || permission !== "default" || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -8, height: 0 }}
        className="overflow-hidden"
      >
        <div className="rounded-xl border border-[#a855f7]/15 bg-gradient-to-br from-[#a855f7]/[0.04] to-[#050508]/80 backdrop-blur-xl p-3 flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-[#a855f7]/10">
            <Bell className="h-4 w-4 text-[#a855f7]" />
          </div>
          <p className="flex-1 text-xs text-gray-400">
            Enable push notifications to get alerted about friend requests, messages, and duels.
          </p>
          <button
            onClick={requestPermission}
            className="text-[10px] px-3 py-1.5 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20 text-[#a855f7] hover:bg-[#a855f7]/20 transition-all font-[family-name:var(--font-mono)] uppercase tracking-wider"
          >
            Enable
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-600 hover:text-gray-400 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
