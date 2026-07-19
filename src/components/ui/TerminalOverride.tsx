"use client";

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

export default memo(function TerminalOverride() {
  const { user } = useAuth();
  const profile = useAppStore(s => s.profile);
  const setProfile = useAppStore(s => s.setProfile);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [overloadActive, setOverloadActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === "X") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
      setInput("");
      setHistory([]);
    }
    if (e.key === "Escape" && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const executeCommand = async (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    setHistory((prev) => [...prev, `> ${cmd}`]);

    if (trimmed === "override_protocol") {
      setHistory((prev) => [
        ...prev,
        "OVERRIDE PROTOCOL DETECTED...",
        "INITIALIZING SYSTEM OVERLOAD...",
      ]);

      setOverloadActive(true);

      await new Promise((r) => setTimeout(r, 1500));
      setHistory((prev) => [...prev, "BYPASSING SECURITY LAYER..."]);
      await new Promise((r) => setTimeout(r, 1000));
      setHistory((prev) => [...prev, "INJECTING NEURAL INTERFACE..."]);
      await new Promise((r) => setTimeout(r, 800));
      setHistory((prev) => [...prev, "ACCESS GRANTED."]);
      await new Promise((r) => setTimeout(r, 500));

      setOverloadActive(false);

      if (user && profile) {
        try {
          const userRef = doc(getFirebaseDb(), "users", user.uid);
          const statsRef = doc(getFirebaseDb(), "stats", user.uid);

          await updateDoc(userRef, {
            overrideUnlocked: true,
          });

          await updateDoc(statsRef, {
            achievements: arrayUnion("override_elite"),
          });

          setProfile({ ...profile, overrideUnlocked: true });
        } catch (err) {
          console.error("Failed to save override:", err);
        }
      }

      setHistory((prev) => [
        ...prev,
        "",
        "═══════════════════════════════════════",
        "  OVERRIDE COMPLETE",
        "  Dark Mode V2 Unlocked",
        "  Achievement: Elite Override",
        "═══════════════════════════════════════",
      ]);

      setTimeout(() => {
        setIsOpen(false);
        setInput("");
      }, 3000);
    } else if (trimmed === "help") {
      setHistory((prev) => [
        ...prev,
        "AVAILABLE COMMANDS:",
        "  override_protocol  - Initiate system override",
        "  help               - Show this menu",
        "  clear              - Clear terminal",
        "  status             - System status",
      ]);
    } else if (trimmed === "clear") {
      setHistory([]);
    } else if (trimmed === "status") {
      setHistory((prev) => [
        ...prev,
        `USER: ${profile?.callsign ?? "UNKNOWN"}`,
        `LEVEL: ${profile?.level ?? 1}`,
        `XP: ${profile?.totalXP ?? 0}`,
        `OVERRIDE: ${profile?.overrideUnlocked ? "UNLOCKED" : "LOCKED"}`,
        `STATUS: OPERATIONAL`,
      ]);
    } else if (trimmed) {
      setHistory((prev) => [...prev, `UNKNOWN COMMAND: ${cmd}`, "Type 'help' for available commands"]);
    }

    setInput("");
  };

  return (
    <>
      {/* System Overload Flash */}
      <AnimatePresence>
        {overloadActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] pointer-events-none"
          >
            {/* Neon blue flash */}
            <motion.div
              animate={{
                opacity: [0, 0.3, 0.1, 0.4, 0.05, 0.2, 0],
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-[#00d4ff]"
            />
            {/* Scan lines */}
            <div className="absolute inset-0 scan-line h-full bg-gradient-to-b from-transparent via-[#00d4ff]/10 to-transparent" />
            {/* Text overlay */}
            <motion.div
              animate={{ opacity: [0, 1, 0.5, 1, 0] }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="text-6xl font-bold text-[#00d4ff] font-[family-name:var(--font-mono)] glow-neon-text tracking-widest">
                OVERLOAD
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 lg:bottom-8 left-4 right-4 lg:left-auto lg:right-8 lg:w-[480px] z-[150]"
          >
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "rgba(2, 8, 23, 0.97)",
                border: "1px solid rgba(0, 212, 255, 0.3)",
                boxShadow: "0 0 30px rgba(0, 212, 255, 0.1), 0 0 60px rgba(0, 212, 255, 0.05)",
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-[#00d4ff]/10">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[9px] text-gray-600 font-[family-name:var(--font-mono)] uppercase tracking-widest ml-2">
                  Terminal v2.1 — {profile?.callsign ?? "UNKNOWN"}
                </span>
              </div>

              {/* Output */}
              <div className="p-4 h-64 overflow-y-auto font-[family-name:var(--font-mono)] text-xs">
                <div className="text-gray-600 mb-2">
                  <span className="text-[#00d4ff]">TASKIVO</span> Terminal Override Interface
                </div>
                <div className="text-gray-700 mb-3 text-[10px]">
                   Press Ctrl+Shift+X to toggle. Type &apos;help&apos; for commands.
                </div>
                {history.map((line, i) => (
                  <div
                    key={i}
                    className={`py-0.5 ${
                      line.startsWith("OVERRIDE") || line.startsWith("ACCESS") || line.includes("COMPLETE") || line.includes("Unlocked")
                        ? "text-[#00d4ff] font-bold"
                        : line.startsWith(">")
                        ? "text-gray-300"
                        : line.includes("═══")
                        ? "text-[#00d4ff]/50"
                        : "text-gray-500"
                    }`}
                  >
                    {line || "\u00A0"}
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 px-4 py-3 border-t border-[#00d4ff]/10 bg-black/30">
                <span className="text-[#00d4ff] text-xs font-[family-name:var(--font-mono)]">{'>'}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && input.trim()) {
                      executeCommand(input);
                    }
                  }}
                  placeholder="Enter command..."
                  className="flex-1 bg-transparent text-gray-300 text-xs font-[family-name:var(--font-mono)] placeholder-gray-700 focus:outline-none"
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
})
