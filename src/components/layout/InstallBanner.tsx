"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import Button from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already running in standalone (installed)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Check if previously dismissed this session
    if (sessionStorage.getItem("taskivo-install-dismissed")) return;

    // iOS Safari detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = !window.matchMedia("(pointer: coarse)").matches || isIOS;
    if (isIOS && isSafari) {
      setShowIOS(true);
      return;
    }

    // Android/Chrome: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroid(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowAndroid(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowAndroid(false);
    setShowIOS(false);
    sessionStorage.setItem("taskivo-install-dismissed", "1");
  };

  return (
    <AnimatePresence>
      {showAndroid && !dismissed && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 glass neon-border rounded-2xl p-4 flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center flex-shrink-0">
            <Download className="h-5 w-5 text-[#00d4ff]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white font-[family-name:var(--font-mono)]">
              INSTALL TASKIVO
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Add to your home screen for the full experience
            </p>
          </div>
          <Button size="sm" onClick={handleInstall} className="shrink-0">
            Install
          </Button>
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-white transition-colors p-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}

      {showIOS && !dismissed && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 glass neon-border rounded-2xl p-4 flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center flex-shrink-0">
            <Download className="h-5 w-5 text-[#00d4ff]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white font-[family-name:var(--font-mono)]">
              INSTALL TASKIVO
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Tap <span className="text-white">Share</span> →{" "}
              <span className="text-white">Add to Home Screen</span>
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-white transition-colors p-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
