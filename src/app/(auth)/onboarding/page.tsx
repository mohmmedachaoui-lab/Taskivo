"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { generateUniqueFriendCode } from "@/lib/callsign";
import { createPublicProfile } from "@/lib/profiles";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Terminal, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [callsign, setCallsign] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        callsign: callsign,
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

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00d4ff] to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#00d4ff]/20"
          >
            <Terminal className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-mono)] tracking-tight">
            <span className="text-[#00d4ff]">&gt;</span> Initialize Profile
          </h1>
          <p className="text-gray-500 mt-1 text-xs font-[family-name:var(--font-mono)] uppercase tracking-widest">
            Choose your operator callsign
          </p>
        </div>

        <div className="glass neon-border rounded-xl p-6 corner-accent">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-[10px] text-gray-500 font-[family-name:var(--font-mono)] uppercase tracking-widest mb-2">
                Callsign
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00d4ff] text-xs font-[family-name:var(--font-mono)]">{'>'}</span>
                <input
                  type="text"
                  value={callsign}
                  onChange={(e) => {
                    setCallsign(e.target.value);
                    setError("");
                  }}
                  placeholder="enter_callsign"
                  className="w-full pl-8 pr-4 py-3 rounded-lg bg-black/40 border border-gray-800 text-white placeholder-gray-700 text-sm font-[family-name:var(--font-mono)] focus:outline-none focus:border-[#00d4ff]/40 focus:ring-1 focus:ring-[#00d4ff]/20 transition-all"
                  maxLength={20}
                />
              </div>
              {error && (
                <p className="mt-2 text-[10px] text-red-400 font-[family-name:var(--font-mono)]">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={callsign.length < 3 || saving}
              variant="neon"
              className="w-full gap-2"
            >
              {saving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#00d4ff] border-t-transparent" />
              ) : (
                <>
                  <ArrowRight className="h-3.5 w-3.5" />
                  INITIALIZE
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center mt-4 text-[9px] text-gray-700 font-[family-name:var(--font-mono)] uppercase tracking-[0.2em]">
          UID: {user.uid.substring(0, 8)}...
        </p>
      </motion.div>
    </div>
  );
}
