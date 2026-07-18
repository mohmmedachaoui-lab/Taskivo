"use client";

import { useState } from "react";
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
} from "lucide-react";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { profile } = useAppStore();
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

  const handleSignOut = async () => {
    await signOut(getFirebaseAuth());
    router.push("/");
  };

  const copyFriendCode = () => {
    if (profile?.friendCode) {
      navigator.clipboard.writeText(profile.friendCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleNotif = (key: keyof typeof notifSettings) => {
    setNotifSettings((prev) => ({ ...prev, [key]: !prev[key] }));
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
          <img src={user.photoURL} alt={profile?.callsign} className="h-20 w-20 rounded-2xl" />
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
        <Card className="p-0">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-4 px-6 py-4 w-full text-left hover:bg-red-500/[0.04] transition-colors rounded-2xl"
          >
            <LogOut className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-red-500">Sign Out</span>
          </button>
        </Card>
      </div>
    </div>
  );
}
