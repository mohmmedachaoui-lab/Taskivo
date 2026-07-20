"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
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
import { useSettleDuels } from "@/hooks/useSettleDuels";
import { initOfflineSync } from "@/lib/offlineSync";

const ChatDrawer = dynamic(() => import("@/components/chat/ChatDrawer"), { ssr: false });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useSettleDuels();

  useEffect(() => {
    initOfflineSync();
  }, []);
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
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border border-[#00d4ff]/20 animate-[spin_3s_linear_infinite]" />
            <div className="absolute inset-1 rounded-full border border-[#00d4ff]/10 animate-[spin_5s_linear_infinite_reverse]" />
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00d4ff] animate-[spin_1.2s_linear_infinite]"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-full bg-[#00d4ff] animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-[#00d4ff]/60 font-[family-name:var(--font-mono)] uppercase tracking-[0.3em]">
              Taskivo
            </span>
            <span className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] animate-pulse">
              Authenticating...
            </span>
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
              {showShell ? (
                <div className="animate-[fadeIn_0.15s_ease-out]">
                  {children}
                </div>
              ) : (
                <div className="p-4 lg:p-6 animate-[fadeIn_0.2s_ease-out]">
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
                          <div className="h-3 w-24 rounded bg-white/[0.04] shimmer" />
                          <div className="h-8 w-16 rounded bg-white/[0.03] shimmer" />
                          <div className="h-2 w-full rounded bg-white/[0.03] shimmer" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </DeepModeProvider>
    </DarkModeV2Provider>
  );
}
