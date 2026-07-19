"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useAppStore } from "@/store";
import { UserProfile, UserStats } from "@/types";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import FloatingActions from "@/components/ui/FloatingActions";
import TerminalOverride from "@/components/ui/TerminalOverride";
import dynamic from "next/dynamic";
import NotificationBanner from "@/components/ui/NotificationBanner";
import InstallBanner from "@/components/layout/InstallBanner";
import OfflineBanner from "@/components/ui/OfflineBanner";
import { DeepModeProvider } from "@/components/ui/DeepMode";
import { DarkModeV2Provider } from "@/components/ui/DarkModeV2";
import { motion, AnimatePresence } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useSettleDuels } from "@/hooks/useSettleDuels";

const ChatDrawer = dynamic(() => import("@/components/chat/ChatDrawer"), { ssr: false });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();
  useSettleDuels();
  const setProfile = useAppStore(s => s.setProfile);
  const setStats = useAppStore(s => s.setStats);
  const [authChecked, setAuthChecked] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const bootRun = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/");
      return;
    }

    setAuthChecked(true);

    if (bootRun.current) return;
    bootRun.current = true;

    const boot = async () => {
      try {
        const db = getFirebaseDb();
        const profileSnap = await getDoc(doc(db, "users", user.uid));

        if (profileSnap.exists()) {
          const data = profileSnap.data();
          if (!data.onboardingComplete) {
            router.push("/onboarding");
            return;
          }
          setProfile(data as UserProfile);
        } else {
          router.push("/onboarding");
          return;
        }

        setOnboardingChecked(true);

        const statsSnap = await getDoc(doc(db, "stats", user.uid));
        if (statsSnap.exists()) {
          setStats(statsSnap.data() as UserStats);
        }
      } catch (err) {
        console.error("Boot failed:", err);
        setOnboardingChecked(true);
      }
    };

    boot();
  }, [user, loading, router, setProfile, setStats]);

  const showShell = authChecked && onboardingChecked;

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center starfield" style={{ background: "#050508" }}>
        <div className="flex flex-col items-center gap-5">
          {/* Orbital ring */}
          <div className="relative h-16 w-16">
            <motion.div
              className="absolute inset-0 rounded-full border border-[#00d4ff]/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-1 rounded-full border border-[#00d4ff]/10"
              animate={{ rotate: -360 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: "2px solid transparent",
                borderTopColor: "#00d4ff",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="h-2.5 w-2.5 rounded-full bg-[#00d4ff]"
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
          {/* Text */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-[#00d4ff]/60 font-[family-name:var(--font-mono)] uppercase tracking-[0.3em]">
              Taskivo
            </span>
            <motion.span
              className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)] uppercase tracking-[0.2em]"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Authenticating...
            </motion.span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DarkModeV2Provider>
      <DeepModeProvider>
        <div className="min-h-screen cyber-grid starfield overflow-x-hidden" style={{ background: "#050508" }}>
          <Sidebar />
          <BottomNav />
          <FloatingActions />
          <TerminalOverride />
          <ChatDrawer />
          <NotificationBanner />
          <InstallBanner />
          <OfflineBanner />
          <main className="pl-0 lg:pl-60 pb-24 lg:pb-0 transition-all duration-300">
            <div className="max-w-[1600px] mx-auto">
              <AnimatePresence mode="wait">
                {showShell ? (
                  <motion.div
                    key={reducedMotion ? "content" : pathname}
                    initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    {children}
                  </motion.div>
                ) : (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 lg:p-6"
                  >
                    <div className="bento-grid">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="bento-card bento-cyan rounded-2xl p-5"
                          style={{
                            gridColumn: i === 0 ? "span 2" : undefined,
                            gridRow: i === 0 ? "span 2" : undefined,
                          }}
                        >
                          <div className="space-y-3">
                            <div className="h-3 w-24 rounded bg-white/[0.04] animate-pulse" />
                            <div className="h-8 w-16 rounded bg-white/[0.03] animate-pulse" />
                            <div className="h-2 w-full rounded bg-white/[0.03] animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </DeepModeProvider>
    </DarkModeV2Provider>
  );
}
