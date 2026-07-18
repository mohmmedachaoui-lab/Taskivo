"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAppStore } from "@/store";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Notifications from "@/components/social/Notifications";
import { clsx } from "clsx";
import { useState } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  AlarmClock,
  Swords,
  Timer,
  BarChart3,
  Settings,
  Trophy,
  Sparkles,
  LogOut,
  Zap,
  ChevronLeft,
  ChevronRight,
  Users,
  Gamepad2,
  Brain,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/alarm", label: "Alarm", icon: AlarmClock },
  { href: "/duels", label: "Duels", icon: Swords },
  { href: "/focus", label: "Focus", icon: Timer },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/achievements", label: "Badges", icon: Trophy },
  { href: "/friends", label: "Social", icon: Sparkles },
  { href: "/guilds", label: "Guilds", icon: Gamepad2 },
  { href: "/settings", label: "System", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut(getFirebaseAuth());
    router.push("/");
  };

  return (
    <aside
      className={clsx(
        "hidden lg:flex fixed left-0 top-0 h-full flex-col z-40 transition-all duration-300",
        collapsed ? "w-[68px]" : "w-60"
      )}
      style={{
        background: "rgba(2, 8, 23, 0.95)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(0, 212, 255, 0.1)",
      }}
    >
      {/* Neon edge line */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#00d4ff]/30 to-transparent" />

      {/* Logo */}
      <div className={clsx("flex items-center border-b border-[#00d4ff]/10", collapsed ? "justify-center p-4" : "gap-3 px-5 py-5")}>
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#00d4ff] to-blue-600 flex items-center justify-center shadow-lg shadow-[#00d4ff]/20 flex-shrink-0">
          <Zap className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight glow-neon-text text-[#00d4ff] font-[family-name:var(--font-mono)]">
            TASKIVO
          </span>
        )}
      </div>

      {/* Profile */}
      {profile && !collapsed && (
        <div className="px-4 py-3 border-b border-[#00d4ff]/10">
          <div className="flex items-center gap-2.5">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt={profile.callsign} className="h-8 w-8 rounded-lg ring-1 ring-[#00d4ff]/30" />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-blue-600 flex items-center justify-center ring-1 ring-[#00d4ff]/30">
                <span className="text-white font-semibold text-xs">{profile.callsign[0].toUpperCase()}</span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{profile.callsign}</p>
              <p className="text-[10px] text-[#00d4ff] font-[family-name:var(--font-mono)]">
                {profile.rank} · L{profile.level}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={clsx(
                "flex items-center gap-2.5 rounded-lg text-xs font-medium transition-all duration-200",
                collapsed ? "justify-center p-2.5" : "px-3 py-2",
                isActive
                  ? "bg-[#00d4ff]/10 text-[#00d4ff] neon-border-active"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]"
              )}
            >
              <item.icon className={clsx("h-4 w-4 flex-shrink-0", isActive && "glow-neon-text")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className={clsx("p-2 border-t border-[#00d4ff]/10 space-y-1", collapsed && "flex flex-col items-center")}>
        {!collapsed && (
          <div className="flex items-center justify-between px-2 py-1">
            <ThemeToggle />
            <Notifications />
          </div>
        )}
        {collapsed && (
          <div className="flex flex-col items-center gap-1 py-1">
            <ThemeToggle />
            <Notifications />
          </div>
        )}
        <button
          onClick={handleSignOut}
          className={clsx(
            "flex items-center gap-2.5 w-full rounded-lg text-xs font-medium text-gray-600 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200",
            collapsed ? "justify-center p-2.5" : "px-3 py-2"
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={clsx(
            "flex items-center gap-2.5 w-full rounded-lg text-xs font-medium text-gray-600 hover:text-[#00d4ff] hover:bg-[#00d4ff]/5 transition-all duration-200",
            collapsed ? "justify-center p-2.5" : "px-3 py-2"
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
