"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAppStore } from "@/store";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Users,
  Trophy,
  Gamepad2,
  Sparkles,
  LogOut,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/guilds", label: "Guilds", icon: Gamepad2 },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/ai-agent", label: "AI Agent", icon: Sparkles },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAppStore();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Taskivo
          </span>
        </Link>
      </div>

      {profile && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {profile.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.callsign}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {profile.callsign[0].toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {profile.callsign}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {profile.rank}
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              {item.label === "AI Agent" && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <ThemeToggle />
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
