"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useAppStore } from "@/store";
import Sidebar from "@/components/layout/Sidebar";
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="pl-64">
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
