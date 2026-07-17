"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import GoogleSignIn from "@/components/auth/GoogleSignIn";
import { motion } from "framer-motion";
import { Zap, Target, Users, Trophy, Sparkles } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const features = [
    { icon: Target, title: "Smart Tasks", desc: "Earn XP by completing tasks with precision" },
    { icon: Users, title: "Guilds", desc: "Team up and compete on leaderboards" },
    { icon: Trophy, title: "Achievements", desc: "Unlock badges for your milestones" },
    { icon: Sparkles, title: "AI Agent", desc: "Coming soon — your productivity AI" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
            Taskivo
          </span>
        </div>
        <GoogleSignIn />
      </nav>

      <main className="max-w-6xl mx-auto px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Productivity meets{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
              gaming
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            Level up your life. Complete tasks, earn XP, climb ranks, and
            compete with friends in the ultimate productivity platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <GoogleSignIn />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <feat.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {feat.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
