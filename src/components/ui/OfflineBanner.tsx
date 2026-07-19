"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff, Wifi, X } from "lucide-react";

export default function OfflineBanner() {
  const { online, wasOffline } = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (online && wasOffline && !dismissed) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setDismissed(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [online, wasOffline, dismissed]);

  useEffect(() => {
    if (!online) setDismissed(false);
  }, [online]);

  const showOffline = !online && !dismissed;
  const showReconnecting = showReconnected && online;

  if (!showOffline && !showReconnecting) return null;

  return (
    <AnimatePresence>
      {showOffline && (
        <motion.div
          key="offline"
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          className="overflow-hidden"
        >
          <div className="rounded-xl border border-amber-500/15 bg-gradient-to-br from-amber-500/[0.04] to-[#050508]/80 backdrop-blur-xl p-3 flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/10">
              <WifiOff className="h-4 w-4 text-amber-400" />
            </div>
            <p className="flex-1 text-xs text-gray-400">
              You&apos;re offline. Some features may be unavailable.
            </p>
            <button
              onClick={() => setDismissed(true)}
              className="p-2 text-gray-600 hover:text-gray-400 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
      {showReconnecting && (
        <motion.div
          key="reconnected"
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          className="overflow-hidden"
        >
          <div className="rounded-xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.04] to-[#050508]/80 backdrop-blur-xl p-3 flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <Wifi className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="flex-1 text-xs text-gray-400">
              Back online — syncing...
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
