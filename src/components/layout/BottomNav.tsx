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
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/alarm", label: "Alarm", icon: AlarmClock },
  { href: "/duels", label: "Duels", icon: Swords },
  { href: "/focus", label: "Focus", icon: Timer },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/80 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/80 lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all duration-200",
                isActive
                  ? "text-blue-500"
                  : "text-gray-400 dark:text-gray-500"
              )}
            >
              <div
                className={clsx(
                  "p-1.5 rounded-xl transition-all duration-200",
                  isActive &&
                    "bg-blue-500/10 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                )}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
