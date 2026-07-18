"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAppStore } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { calculateLevel, getRankTitle, calculateXPProgress } from "@/lib/xp-engine";
import LevelRing from "@/components/gamification/LevelRing";
import {
  Settings as SettingsIcon,
  Globe,
  Bell,
  Shield,
  Palette,
  LogOut,
  ChevronRight,
  User,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { profile, stats } = useAppStore();
  const { user } = useAuth();
  const router = useRouter();
  const level = profile ? calculateLevel(profile.totalXP) : 1;
  const xpProgress = profile ? calculateXPProgress(profile.totalXP) : 0;
  const rank = getRankTitle(level);

  const handleSignOut = async () => {
    await signOut(getFirebaseAuth());
    router.push("/");
  };

  const sections = [
    {
      title: "Preferences",
      items: [
        { icon: <Palette className="h-5 w-5" />, label: "Theme", action: <ThemeToggle /> },
        { icon: <Globe className="h-5 w-5" />, label: "Language", value: "English" },
        { icon: <Bell className="h-5 w-5" />, label: "Notifications", value: "On" },
        { icon: <Shield className="h-5 w-5" />, label: "Privacy", value: "Public" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-mono)] tracking-tight"><span className="text-[#00d4ff]">&gt;</span> System</h1>
        <p className="text-gray-500 mt-0.5 text-xs font-[family-name:var(--font-mono)] uppercase tracking-widest">Customize your experience</p>
      </div>

      <Card className="flex items-center gap-6">
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={profile?.callsign}
            className="h-20 w-20 rounded-2xl"
          />
        ) : (
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <User className="h-10 w-10 text-white" />
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {profile?.callsign ?? "Agent"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user?.email}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-medium">
              Level {level}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 font-medium">
              {rank}
            </span>
            <span className="text-xs text-gray-500">
              {profile?.totalXP ?? 0} XP
            </span>
          </div>
        </div>
        <LevelRing level={level} xpProgress={xpProgress} xpMax={500} size={80} />
      </Card>

      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 px-1">
            {section.title}
          </h3>
          <Card className="divide-y divide-gray-100 dark:divide-gray-800 p-0">
            {section.items.map((item, i) => (
              <div
                key={item.label}
                className="flex items-center gap-4 px-6 py-4"
              >
                <div className="text-gray-400">{item.icon}</div>
                <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
                  {item.label}
                </span>
                {item.action ??
                  (item.value && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{item.value}</span>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </div>
                  ))}
              </div>
            ))}
          </Card>
        </div>
      ))}

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 px-1">
          Account
        </h3>
        <Card className="p-0">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-4 px-6 py-4 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-2xl"
          >
            <LogOut className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-red-500">Sign Out</span>
          </button>
        </Card>
      </div>
    </div>
  );
}
