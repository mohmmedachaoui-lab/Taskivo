"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

interface XPCelebrationProps {
  amount: number;
  show: boolean;
  onComplete?: () => void;
}

export default function XPCelebration({ amount, show, onComplete }: XPCelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const t = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1, y: 0, scale: 0.8 }}
          animate={{ opacity: 0, y: -40, scale: 1.1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center z-50"
        >
          <span className="flex items-center gap-1 text-sm font-bold font-[family-name:var(--font-mono)] text-[#10b981] drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]">
            <Zap className="h-4 w-4" />
            +{amount} XP
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
