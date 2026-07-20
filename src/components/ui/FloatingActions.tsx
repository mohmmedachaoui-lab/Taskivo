"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Plus, CheckSquare, Swords, Timer, X } from "lucide-react";

const actions = [
  { href: "/tasks", label: "New Mission", icon: CheckSquare },
  { href: "/duels", label: "Challenge", icon: Swords },
  { href: "/focus", label: "Focus", icon: Timer },
];

export default function FloatingActions() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-4 lg:right-8 z-50" style={{ bottom: "calc(6rem + env(safe-area-inset-bottom))" }}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 space-y-2"
          >
            {actions.map((action, i) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={action.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 glass neon-border rounded-lg px-3 py-2 text-xs text-gray-300 hover:text-[#00d4ff] hover-glow transition-all duration-200 font-[family-name:var(--font-mono)] whitespace-nowrap"
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-[#00d4ff] to-blue-600 flex items-center justify-center text-gray-900 shadow-lg shadow-[#00d4ff]/30 hover-glow transition-all duration-300"
      >
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </motion.div>
        {/* Pulse ring */}
        {!open && (
          <div className="absolute inset-0 rounded-xl pulse-neon pointer-events-none" />
        )}
      </motion.button>
    </div>
  );
}
