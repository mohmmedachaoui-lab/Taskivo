"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { generateUniqueFriendCode } from "@/lib/callsign";
import { createPublicProfile } from "@/lib/profiles";
import Button from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  Terminal,
  ArrowRight,
  Check,
  Zap,
  Target,
  Swords,
  SkipForward,
  Pencil,
} from "lucide-react";

const FOCUS_OPTIONS = [
  { id: "tasks", label: "Missions", desc: "Create and complete tasks", icon: Target, color: "#facc15" },
  { id: "focus", label: "Deep Work", desc: "Pomodoro focus sessions", icon: Zap, color: "#00d4ff" },
  { id: "duels", label: "Compete", desc: "1v1 XP duels", icon: Swords, color: "#ef4444" },
] as const;

type FocusId = (typeof FOCUS_OPTIONS)[number]["id"];

function generateCallsign(displayName: string | null, email: string | null): string {
  const source = displayName || email?.split("@")[0] || "agent";
  const cleaned = source.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8);
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${cleaned}_${suffix}`;
}

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const reducedMotion = usePrefersReducedMotion();
  const [step, setStep] = useState<0 | 1>(0);
  const [callsign, setCallsign] = useState("");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [focusPrefs, setFocusPrefs] = useState<FocusId[]>([]);
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    if (user && generating) {
      setCallsign(generateCallsign(user.displayName, user.email));
      const timer = setTimeout(() => setGenerating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [user, generating]);

  useEffect(() => {
    if (!generating && step === 0) {
      const timer = setTimeout(() => setRevealed(true), 100);
      return () => clearTimeout(timer);
    }
  }, [generating, step]);

  const toggleFocus = (id: FocusId) => {
    setFocusPrefs((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleComplete = useCallback(async () => {
    if (!user) return;

    if (callsign.length < 3) {
      setError("Callsign must be at least 3 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(callsign)) {
      setError("Only letters, numbers, and underscores allowed");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const userRef = doc(getFirebaseDb(), "users", user.uid);
      const existing = await getDoc(userRef);

      if (existing.exists() && existing.data().onboardingComplete) {
        router.push("/dashboard");
        return;
      }

      const { friendCode, friendSuffix } = await generateUniqueFriendCode(callsign);

      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        callsign,
        friendCode,
        friendSuffix,
        rank: "Novice",
        level: 1,
        totalXP: 0,
        createdAt: Date.now(),
        onboardingComplete: true,
      });

      await setDoc(doc(getFirebaseDb(), "stats", user.uid), {
        uid: user.uid,
        tasksCompleted: 0,
        tasksFailed: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalXP: 0,
        level: 1,
        guildId: null,
        achievements: [],
        xpLost: 0,
      });

      await createPublicProfile(user.uid, {
        uid: user.uid,
        callsign,
        photoURL: user.photoURL,
        friendCode,
        friendSuffix,
        rank: "Novice",
        level: 1,
        totalXP: 0,
      });

      if (focusPrefs.length > 0) {
        localStorage.setItem("taskivo-focus-pref", JSON.stringify(focusPrefs));
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  }, [user, callsign, focusPrefs, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#020817" }}>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00d4ff] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center cyber-grid px-4" style={{ background: "#020817" }}>
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={reducedMotion ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.15, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00d4ff] to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#00d4ff]/20"
                >
                  <Terminal className="h-8 w-8 text-white" strokeWidth={2.5} />
                </motion.div>
                <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-mono)] tracking-tight">
                  <span className="text-[#00d4ff]">&gt;</span> Mission Briefing
                </h1>
                <p className="text-gray-500 mt-1 text-xs font-[family-name:var(--font-mono)] uppercase tracking-widest">
                  System initialization complete
                </p>
              </div>

              <div className="glass neon-border rounded-xl p-6 corner-accent">
                {generating ? (
                  <div className="flex flex-col items-center gap-4 py-6">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#00d4ff] border-t-transparent" />
                    <p className="text-[10px] text-gray-500 font-[family-name:var(--font-mono)] uppercase tracking-widest">
                      Generating callsign...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-5">
                      <label className="block text-[10px] text-gray-500 font-[family-name:var(--font-mono)] uppercase tracking-widest mb-2">
                        Your Callsign
                      </label>
                      {editing ? (
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00d4ff] text-xs font-[family-name:var(--font-mono)]">{'>'}</span>
                          <input
                            type="text"
                            value={callsign}
                            onChange={(e) => {
                              setCallsign(e.target.value);
                              setError("");
                            }}
                            onBlur={() => { if (callsign.length >= 3) setEditing(false); }}
                            autoFocus
                            placeholder="enter_callsign"
                            className="w-full pl-8 pr-4 py-3 rounded-lg bg-black/40 border border-gray-800 text-white placeholder-gray-700 text-sm font-[family-name:var(--font-mono)] focus:outline-none focus:border-[#00d4ff]/40 focus:ring-1 focus:ring-[#00d4ff]/20 transition-all"
                            maxLength={20}
                          />
                        </div>
                      ) : (
                        <motion.div
                          initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, type: "spring", stiffness: 150, delay: 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className="flex-1 py-3 px-4 rounded-lg bg-black/40 border border-[#00d4ff]/20">
                            <motion.span
                              initial={reducedMotion ? false : { opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.6, delay: 0.2 }}
                              className="text-lg font-bold text-[#00d4ff] font-[family-name:var(--font-mono)]"
                              style={{ textShadow: revealed ? "0 0 20px rgba(0,212,255,0.4)" : "none" }}
                            >
                              {callsign}
                            </motion.span>
                          </div>
                          <button
                            onClick={() => setEditing(true)}
                            className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-gray-500 hover:text-[#00d4ff] hover:border-[#00d4ff]/20 transition-all"
                            title="Edit callsign"
                          >
                            <Pencil className="h-3.5 w-3.5" strokeWidth={2.5} />
                          </button>
                        </motion.div>
                      )}
                      {error && (
                        <p className="mt-2 text-[10px] text-red-400 font-[family-name:var(--font-mono)]">{error}</p>
                      )}
                    </div>

                    <Button
                      onClick={() => setStep(1)}
                      disabled={callsign.length < 3}
                      variant="neon"
                      className="w-full gap-2"
                    >
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Continue
                    </Button>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-[9px] text-gray-700 font-[family-name:var(--font-mono)] uppercase tracking-[0.2em]">
                  UID: {user.uid.substring(0, 8)}...
                </p>
                {!generating && (
                  <button
                    onClick={handleComplete}
                    className="flex items-center gap-1 text-[9px] text-gray-700 hover:text-gray-500 font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] transition-colors"
                  >
                    <SkipForward className="h-3 w-3" strokeWidth={2.5} />
                    Skip
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="focus"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-mono)] tracking-tight">
                  <span className="text-[#00d4ff]">&gt;</span> Select Focus
                </h1>
                <p className="text-gray-500 mt-1 text-xs font-[family-name:var(--font-mono)] uppercase tracking-widest">
                  What&apos;s your primary mission?
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {FOCUS_OPTIONS.map((opt, i) => {
                  const Icon = opt.icon;
                  const selected = focusPrefs.includes(opt.id);
                  return (
                    <motion.button
                      key={opt.id}
                      initial={reducedMotion ? false : { opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.08 }}
                      onClick={() => toggleFocus(opt.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        selected
                          ? "bg-white/[0.04] border-[#00d4ff]/20"
                          : "bg-white/[0.01] border-white/[0.04] hover:border-white/[0.08]"
                      }`}
                    >
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${opt.color}15, ${opt.color}05)`,
                          border: `1px solid ${opt.color}20`,
                        }}
                      >
                        <Icon className="h-5 w-5" style={{ color: opt.color }} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-white">{opt.label}</p>
                        <p className="text-[10px] text-gray-500 font-[family-name:var(--font-mono)]">{opt.desc}</p>
                      </div>
                      {selected && (
                        <motion.div
                          initial={reducedMotion ? false : { scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                          <Check className="h-5 w-5 text-[#00d4ff]" strokeWidth={2.5} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <Button
                onClick={handleComplete}
                variant="neon"
                className="w-full gap-2"
                disabled={saving}
              >
                {saving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#00d4ff] border-t-transparent" />
                ) : (
                  <>
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Deploy to Dashboard
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center mt-4">
                <button
                  onClick={handleComplete}
                  className="flex items-center gap-1 text-[9px] text-gray-700 hover:text-gray-500 font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] transition-colors"
                >
                  <SkipForward className="h-3 w-3" strokeWidth={2.5} />
                  Skip
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
