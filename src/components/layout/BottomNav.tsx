"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  Home,
  CheckSquare,
  AlarmClock,
  Swords,
  Timer,
  BarChart3,
  Settings,
} from "lucide-react";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/tasks", label: "Missions", icon: CheckSquare },
  { href: "/alarm", label: "Alarm", icon: AlarmClock },
  { href: "/duels", label: "Duels", icon: Swords },
  { href: "/focus", label: "Focus", icon: Timer },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/settings", label: "Sys", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{
        background: "rgba(2, 8, 23, 0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(0, 212, 255, 0.1)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Top neon line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00d4ff]/40 to-transparent" />

      <div className="flex items-center justify-around px-1 py-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-[9px] font-medium transition-all duration-200 font-[family-name:var(--font-mono)]",
                isActive
                  ? "text-[#00d4ff]"
                  : "text-gray-600"
              )}
            >
              <div
                className={clsx(
                  "p-2 rounded-lg transition-all duration-200",
                  isActive && "bg-[#00d4ff]/10 shadow-[0_0_10px_rgba(0,212,255,0.2)]"
                )}
              >
                <item.icon className="h-4 w-4" />
              </div>
              <span className="uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
