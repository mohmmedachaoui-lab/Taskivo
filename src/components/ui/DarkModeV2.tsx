"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAppStore } from "@/store";

interface DarkModeV2ContextType {
  isV2: boolean;
  toggleV2: () => void;
}

const DarkModeV2Context = createContext<DarkModeV2ContextType>({
  isV2: false,
  toggleV2: () => {},
});

export function useDarkModeV2() {
  return useContext(DarkModeV2Context);
}

export function DarkModeV2Provider({ children }: { children: ReactNode }) {
  const { profile } = useAppStore();
  const [isV2, setIsV2] = useState(false);
  const unlocked = profile?.overrideUnlocked ?? false;

  useEffect(() => {
    if (isV2) {
      document.documentElement.classList.add("dark-mode-v2");
    } else {
      document.documentElement.classList.remove("dark-mode-v2");
    }
    return () => document.documentElement.classList.remove("dark-mode-v2");
  }, [isV2]);

  const toggleV2 = () => {
    if (unlocked) {
      setIsV2((p) => !p);
    }
  };

  return (
    <DarkModeV2Context.Provider value={{ isV2, toggleV2 }}>
      {children}
    </DarkModeV2Context.Provider>
  );
}
