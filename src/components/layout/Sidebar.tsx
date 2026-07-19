"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAppStore } from "@/store";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Notifications from "@/components/social/Notifications";
import { useDarkModeV2 } from "@/components/ui/DarkModeV2";
import { clsx } from "clsx";
import { useState, memo } from "react";
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
  Gamepad2,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, accent: "#00d4ff" },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, accent: "#facc15" },
  { href: "/alarm", label: "Alarm", icon: AlarmClock, accent: "#f97316" },
  { href: "/duels", label: "Duels", icon: Swords, accent: "#ef4444" },
  { href: "/focus", label: "Focus", icon: Timer, accent: "#3b82f6" },
  { href: "/stats", label: "Stats", icon: BarChart3, accent: "#00d4ff" },
  { href: "/achievements", label: "Badges", icon: Trophy, accent: "#facc15" },
  { href: "/friends", label: "Social", icon: Sparkles, accent: "#a855f7" },
  { href: "/guilds", label: "Guilds", icon: Gamepad2, accent: "#a855f7" },
  { href: "/settings", label: "System", icon: Settings, accent: "#6b7280" },
];

export default memo(function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useAppStore(s => s.profile);
  const { isV2, toggleV2 } = useDarkModeV2();
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
        background: "rgba(5, 5, 8, 0.92)",
        backdropFilter: "blur(24px) saturate(1.2)",
        borderRight: "1px solid rgba(0, 212, 255, 0.06)",
      }}
    >
      {/* Neon edge line */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#00d4ff]/20 to-transparent" />

      {/* Active indicator bar */}
      <div
        className="absolute left-0 w-[2px] rounded-r transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          top: `${navItems.findIndex((item) => pathname === item.href) * 36 + 180}px`,
          height: "28px",
          background: navItems.find((item) => pathname === item.href)?.accent ?? "transparent",
          boxShadow: `0 0 8px ${navItems.find((item) => pathname === item.href)?.accent ?? "transparent"}60`,
          opacity: pathname === "/" ? 0 : 1,
        }}
      />

      {/* Logo */}
      <div className={clsx("flex items-center border-b border-white/[0.04]", collapsed ? "justify-center p-4" : "gap-3 px-5 py-5")}>
        <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-[#a855f7] via-[#3b82f6] to-[#00d4ff] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#00d4ff]/15">
          <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#a855f7] via-[#3b82f6] to-[#00d4ff] opacity-40 blur-md -z-10" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight gradient-text-cyber font-[family-name:var(--font-mono)]">
            TASKIVO
          </span>
        )}
      </div>

      {/* Profile */}
      {profile && !collapsed && (
        <div className="px-4 py-3 border-b border-white/[0.04]">
          <div className="flex items-center gap-2.5">
            {profile.photoURL ? (
              <div className="relative">
                <Image src={profile.photoURL} alt={profile.callsign} width={32} height={32} className="h-8 w-8 rounded-lg ring-1 ring-[#00d4ff]/20 object-cover" />
                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#10b981] border-2 border-[#050508]" />
              </div>
            ) : (
              <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-[#a855f7] to-[#00d4ff] flex items-center justify-center ring-1 ring-[#00d4ff]/20">
                <span className="text-white font-semibold text-xs">{profile.callsign[0].toUpperCase()}</span>
                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#10b981] border-2 border-[#050508]" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{profile.callsign}</p>
              <span className="badge badge-info" style={{ padding: "1px 6px", fontSize: "8px" }}>
                <span className="badge-dot" />
                {profile.rank} · L{profile.level}
              </span>
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
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]"
              )}
              style={isActive ? {
                background: `rgba(${item.accent === "#00d4ff" ? "0,212,255" : item.accent === "#facc15" ? "250,204,21" : item.accent === "#f97316" ? "249,115,22" : item.accent === "#ef4444" ? "239,68,68" : item.accent === "#3b82f6" ? "59,130,246" : item.accent === "#a855f7" ? "168,85,247" : "107,114,128"}, 0.08)`,
                boxShadow: `inset 0 0 12px rgba(${item.accent === "#00d4ff" ? "0,212,255" : item.accent === "#facc15" ? "250,204,21" : item.accent === "#f97316" ? "249,115,22" : item.accent === "#ef4444" ? "239,68,68" : item.accent === "#3b82f6" ? "59,130,246" : item.accent === "#a855f7" ? "168,85,247" : "107,114,128"}, 0.06)`,
                borderLeft: `2px solid ${item.accent}`,
              } : undefined}
            >
              <item.icon
                className="h-4 w-4 flex-shrink-0"
                style={isActive ? {
                  color: item.accent,
                  filter: `drop-shadow(0 0 6px ${item.accent}80)`,
                } : undefined}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {!collapsed && <span style={isActive ? { color: item.accent } : undefined}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className={clsx("p-2 border-t border-white/[0.04] space-y-1", collapsed && "flex flex-col items-center")}>
        {!collapsed && (
          <div className="flex items-center justify-between px-2 py-1">
            <ThemeToggle />
            {profile?.overrideUnlocked && (
              <button
                onClick={toggleV2}
                className={clsx(
                  "p-2 rounded-lg text-[9px] font-[family-name:var(--font-mono)] uppercase tracking-wider transition-all duration-200",
                  isV2
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    : "bg-white/[0.02] text-gray-600 border border-white/[0.04] hover:border-white/[0.08]"
                )}
                title="Dark Mode V2 (Override Unlocked)"
              >
                V2
              </button>
            )}
            <Notifications />
          </div>
        )}
        {collapsed && (
          <div className="flex flex-col items-center gap-1 py-1">
            <ThemeToggle />
            {profile?.overrideUnlocked && (
              <button
                onClick={toggleV2}
                className={clsx(
                  "p-2 rounded-lg text-[8px] font-[family-name:var(--font-mono)] transition-all duration-200",
                  isV2
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    : "bg-white/[0.02] text-gray-600 border border-white/[0.04]"
                )}
                title="Dark Mode V2"
              >
                V2
              </button>
            )}
            <Notifications />
          </div>
        )}
        <button
          onClick={handleSignOut}
          className={clsx(
            "flex items-center gap-2.5 w-full rounded-lg text-xs font-medium text-gray-600 hover:text-red-400 hover:bg-red-500/[0.04] transition-all duration-200",
            collapsed ? "justify-center p-2.5" : "px-3 py-2"
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={clsx(
            "flex items-center gap-2.5 w-full rounded-lg text-xs font-medium text-gray-600 hover:text-[#00d4ff] hover:bg-[#00d4ff]/[0.03] transition-all duration-200",
            collapsed ? "justify-center p-2.5" : "px-3 py-2"
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
})
