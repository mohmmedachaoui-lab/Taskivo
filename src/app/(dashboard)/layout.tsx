"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useAppStore } from "@/store";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import FloatingActions from "@/components/ui/FloatingActions";
import TerminalOverride from "@/components/ui/TerminalOverride";
import { DeepModeProvider } from "@/components/ui/DeepMode";
import { DarkModeV2Provider } from "@/components/ui/DarkModeV2";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { setProfile, setStats } = useAppStore();
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/");
      return;
    }

    const loadUserData = async () => {
      try {
        const profileSnap = await getDoc(doc(getFirebaseDb(), "users", user.uid));
        const statsSnap = await getDoc(doc(getFirebaseDb(), "stats", user.uid));

        if (profileSnap.exists()) {
          const data = profileSnap.data();
          if (!data.onboardingComplete) {
            router.push("/onboarding");
            return;
          }
          setProfile(data as any);
        }

        if (statsSnap.exists()) {
          setStats(statsSnap.data() as any);
        }

        setDataLoaded(true);
      } catch (err) {
        console.error("Failed to load user data:", err);
        setDataLoaded(true);
      }
    };

    loadUserData();
  }, [user, loading, router, setProfile, setStats]);

  if (loading || !dataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#020817" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-xl bg-[#00d4ff]/20 animate-ping" />
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-blue-600 flex items-center justify-center">
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
          <span className="text-xs text-gray-600 font-[family-name:var(--font-mono)] uppercase tracking-widest">
            Initializing...
          </span>
        </div>
      </div>
    );
  }

  return (
    <DarkModeV2Provider>
      <DeepModeProvider>
        <div className="min-h-screen cyber-grid" style={{ background: "#020817" }}>
          <Sidebar />
          <BottomNav />
          <FloatingActions />
          <TerminalOverride />
          <main className="pl-0 lg:pl-60 pb-24 lg:pb-0 transition-all duration-300">
            <div className="max-w-[1600px] mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </div>
          </main>
        </div>
      </DeepModeProvider>
    </DarkModeV2Provider>
  );
}
