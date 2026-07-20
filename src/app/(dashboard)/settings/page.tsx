"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Card from "@/components/ui/Card";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAppStore } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { calculateLevel, getRankTitle, calculateXPProgress } from "@/lib/xp-engine";
import LevelRing from "@/components/gamification/LevelRing";
import {
  Globe,
  Palette,
  LogOut,
  ChevronRight,
  User,
  Copy,
  CheckCircle2,
  MessageSquare,
  Swords,
  Trophy,
  Users,
  ShieldAlert,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { showToast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const profile = useAppStore(s => s.profile);
  const { user } = useAuth();
  const router = useRouter();
  const level = profile ? calculateLevel(profile.totalXP) : 1;
  const xpProgress = profile ? calculateXPProgress(profile.totalXP) : 0;
  const rank = getRankTitle(level);
  const [copied, setCopied] = useState(false);
  const [notifSettings, setNotifSettings] = useState({
    friendRequests: true,
    messages: true,
    duels: true,
    achievements: true,
  });
  const [showSignOut, setShowSignOut] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetStep, setResetStep] = useState(0);
  const [resetInput, setResetInput] = useState("");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(getFirebaseDb(), "users", user.uid))
      .then((snap) => {
        if (snap.exists()) {
          const saved = snap.data().notificationSettings;
          if (saved) {
            setNotifSettings((prev) => ({ ...prev, ...saved }));
          }
        }
      })
      .catch(() => {});
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(getFirebaseAuth());
      router.push("/");
    } catch {
      showToast("Failed to sign out", "error");
    }
  };

  const handleResetData = async () => {
    if (!user) return;
    setResetting(true);
    try {
      await deleteDoc(doc(getFirebaseDb(), "stats", user.uid));
      await deleteDoc(doc(getFirebaseDb(), "publicProfiles", user.uid));
      await deleteDoc(doc(getFirebaseDb(), "users", user.uid));
      await signOut(getFirebaseAuth());
      showToast("Data cleared. Signing out...", "success");
      router.push("/");
    } catch {
      showToast("Failed to reset data. Please try again.", "error");
    }
    setResetting(false);
  };

  const copyFriendCode = () => {
    if (profile?.friendCode) {
      navigator.clipboard.writeText(profile.friendCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleNotif = async (key: keyof typeof notifSettings) => {
    const newVal = !notifSettings[key];
    setNotifSettings((prev) => ({ ...prev, [key]: newVal }));
    if (user) {
      try {
        await updateDoc(doc(getFirebaseDb(), "users", user.uid), {
          [`notificationSettings.${key}`]: newVal,
        });
      } catch {
        setNotifSettings((prev) => ({ ...prev, [key]: !newVal }));
        showToast("Failed to update notification settings", "error");
      }
    }
  };

  const sections = [
    {
      title: "Preferences",
      items: [
        { icon: <Palette className="h-5 w-5" />, label: "Theme", action: <ThemeToggle /> },
        { icon: <Globe className="h-5 w-5" />, label: "Language", value: "English" },
      ],
    },
  ];

  const notifItems = [
    { key: "friendRequests" as const, icon: <Users className="h-4 w-4" />, label: "Friend Requests", color: "#a855f7" },
    { key: "messages" as const, icon: <MessageSquare className="h-4 w-4" />, label: "Messages", color: "#a855f7" },
    { key: "duels" as const, icon: <Swords className="h-4 w-4" />, label: "Duels", color: "#ef4444" },
    { key: "achievements" as const, icon: <Trophy className="h-4 w-4" />, label: "Achievements", color: "#facc15" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-mono)] tracking-tight">
          <span className="text-[#00d4ff]">&gt;</span> System
        </h1>
        <p className="text-gray-500 mt-0.5 text-xs font-[family-name:var(--font-mono)] uppercase tracking-widest">
          Customize your experience
        </p>
      </div>

      {/* Profile Card */}
      <Card className="flex items-center gap-6">
        {user?.photoURL ? (
          <Image src={user.photoURL} alt={profile?.callsign ?? ""} width={80} height={80} className="h-20 w-20 rounded-2xl object-cover" />
        ) : (
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <User className="h-10 w-10 text-white" />
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile?.callsign ?? "Agent"}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-medium">Level {level}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 font-medium">{rank}</span>
            <span className="text-xs text-gray-500">{profile?.totalXP ?? 0} XP</span>
          </div>
        </div>
        <LevelRing level={level} xpProgress={xpProgress} xpMax={500} size={80} />
      </Card>

      {/* Friend Code */}
      {profile?.friendCode && (
        <Card className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-500 font-[family-name:var(--font-mono)] uppercase tracking-widest mb-1">
              Friend Code
            </p>
            <p className="text-lg font-bold text-[#a855f7] font-[family-name:var(--font-mono)] tracking-wide">
              {profile.friendCode}
            </p>
            <p className="text-[10px] text-gray-600 mt-0.5">Share this code so others can add you</p>
          </div>
          <button
            onClick={copyFriendCode}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#a855f7]/8 border border-[#a855f7]/20 text-[#a855f7] hover:bg-[#a855f7]/15 transition-all text-xs font-[family-name:var(--font-mono)]"
          >
            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </Card>
      )}

      {/* Sections */}
      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 px-1">{section.title}</h3>
          <Card className="divide-y divide-gray-100 dark:divide-gray-800/40 p-0">
            {section.items.map((item) => (
              <div key={item.label} className="flex items-center gap-4 px-6 py-4">
                <div className="text-gray-400">{item.icon}</div>
                <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">{item.label}</span>
                {item.action ?? (
                  item.value && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{item.value}</span>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </div>
                  )
                )}
              </div>
            ))}
          </Card>
        </div>
      ))}

      {/* Notification Settings */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 px-1">Notifications</h3>
        <Card className="divide-y divide-white/[0.04] p-0">
          {notifItems.map((item) => (
            <div key={item.key} className="flex items-center gap-4 px-6 py-3.5">
              <div style={{ color: item.color }}>{item.icon}</div>
              <span className="flex-1 text-sm font-medium text-white">{item.label}</span>
              <button
                onClick={() => toggleNotif(item.key)}
                aria-label={`${notifSettings[item.key] ? "Disable" : "Enable"} ${item.label} notifications`}
                aria-pressed={notifSettings[item.key]}
                className={`relative w-10 h-5 rounded-full transition-all duration-200 ${
                  notifSettings[item.key]
                    ? "bg-[#a855f7]/20 border border-[#a855f7]/30"
                    : "bg-white/[0.04] border border-white/[0.06]"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-4 w-4 rounded-full transition-all duration-200 ${
                    notifSettings[item.key]
                      ? "left-5 bg-[#a855f7] shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                      : "left-0.5 bg-gray-500"
                  }`}
                />
              </button>
            </div>
          ))}
        </Card>
      </div>

      {/* Account */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 px-1">Account</h3>
        <Card className="divide-y divide-white/[0.04] p-0">
          <button
            onClick={() => setShowSignOut(true)}
            className="flex items-center gap-4 px-6 py-4 w-full text-left hover:bg-white/[0.02] transition-colors"
          >
            <LogOut className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Sign Out</span>
          </button>
        </Card>
      </div>

      {/* Danger Zone */}
      <div>
        <h3 className="text-sm font-medium text-[#ef4444]/60 mb-3 px-1 flex items-center gap-2">
          <ShieldAlert className="h-3.5 w-3.5" />
          Danger Zone
        </h3>
        <Card className="border-[#ef4444]/10 p-0">
          <button
            onClick={() => { setShowReset(true); setResetStep(0); setResetInput(""); }}
            className="flex items-center gap-4 px-6 py-4 w-full text-left hover:bg-[#ef4444]/[0.04] transition-colors"
          >
            <Trash2 className="h-5 w-5 text-[#ef4444]" />
            <div className="flex-1">
              <span className="text-sm font-medium text-[#ef4444]">Reset All Data</span>
              <p className="text-xs text-gray-500 mt-0.5">Permanently delete your stats, progress, and profile</p>
            </div>
          </button>
        </Card>
      </div>

      {/* Sign Out Confirmation */}
      <ConfirmDialog
        open={showSignOut}
        title="Sign Out"
        message="Are you sure you want to sign out? You'll need to log back in to access your account."
        confirmLabel="Sign Out"
        variant="warning"
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOut(false)}
      />

      {/* Reset Data — Step 1: Initial confirmation */}
      <ConfirmDialog
        open={showReset && resetStep === 0}
        title="Reset All Data"
        message="This will permanently delete ALL your stats, achievements, progress, and profile data. This cannot be undone."
        confirmLabel="I understand, continue"
        variant="danger"
        onConfirm={() => setResetStep(1)}
        onCancel={() => setShowReset(false)}
      />

      {/* Reset Data — Step 2: Type-to-confirm */}
      {showReset && resetStep === 1 && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80]"
            onClick={() => setShowReset(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-confirm-title"
            aria-describedby="reset-confirm-desc"
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-xs mx-auto z-[80] glass neon-border border-[#ef4444]/30 rounded-2xl p-5"
          >
            <div className="flex justify-center mb-3" aria-hidden="true">
              <div className="h-1 w-8 rounded-full bg-gray-600" />
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-xl bg-[#ef4444]/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <AlertTriangle className="h-5 w-5 text-[#ef4444]" />
              </div>
              <h3
                id="reset-confirm-title"
                className="text-sm font-semibold text-white font-[family-name:var(--font-mono)]"
              >
                Type &quot;DELETE&quot; to confirm
              </h3>
            </div>
            <p id="reset-confirm-desc" className="text-xs text-gray-400 mb-4 leading-relaxed">
              This action is irreversible. All your data will be permanently removed.
            </p>
            <input
              type="text"
              value={resetInput}
              onChange={(e) => setResetInput(e.target.value)}
              placeholder='Type "DELETE"'
              autoFocus
              aria-label='Type DELETE to confirm data reset'
              className="w-full px-4 py-2.5 rounded-xl border border-[#ef4444]/20 bg-[#ef4444]/5 text-white placeholder-gray-500 text-sm font-[family-name:var(--font-mono)] focus:ring-2 focus:ring-[#ef4444]/40 focus:border-transparent mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowReset(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-gray-300 text-sm font-medium hover:bg-white/[0.08] transition-colors"
                disabled={resetting}
                aria-label="Cancel data reset"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                disabled={resetInput !== "DELETE" || resetting}
                aria-label="Delete all data permanently"
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white text-sm font-medium border border-[#ef4444]/40 shadow-[0_0_20px_rgba(239,68,68,0.2)] disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                {resetting ? "Deleting..." : "Delete Everything"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
