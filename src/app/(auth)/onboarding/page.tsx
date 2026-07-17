"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import { User, ArrowRight } from "lucide-react";

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
      const userRef = doc(db, "users", user.uid);
      const existing = await getDoc(userRef);

      if (existing.exists() && existing.data().onboardingComplete) {
        router.push("/dashboard");
        return;
      }

      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        callsign: callsign,
        rank: "Novice",
        level: 1,
        totalXP: 0,
        createdAt: Date.now(),
        onboardingComplete: true,
      });

      await setDoc(doc(db, "stats", user.uid), {
        uid: user.uid,
        tasksCompleted: 0,
        tasksFailed: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalXP: 0,
        level: 1,
        guildId: null,
        achievements: [],
      });

      router.push("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 px-4">
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
            className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mx-auto mb-4"
          >
            <User className="h-10 w-10 text-blue-600" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Choose your callsign
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            This will be your identity in the Taskivo universe
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Callsign
              </label>
              <input
                type="text"
                value={callsign}
                onChange={(e) => {
                  setCallsign(e.target.value);
                  setError("");
                }}
                placeholder="Enter your callsign"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                maxLength={20}
              />
              {error && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={callsign.length < 3 || saving}
              className="w-full gap-2"
            >
              {saving ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Start your journey
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
