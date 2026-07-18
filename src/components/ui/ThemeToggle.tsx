"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-7 w-7 rounded-lg bg-white/[0.03]" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-gray-800 hover:border-[#00d4ff]/20 transition-all duration-200"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Monitor className="h-3.5 w-3.5 text-gray-500" />
      ) : (
        <Moon className="h-3.5 w-3.5 text-[#00d4ff]" />
      )}
    </button>
  );
}
