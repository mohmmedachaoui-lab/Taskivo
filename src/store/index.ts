"use client";

import { create } from "zustand";
import { UserProfile, UserStats } from "@/types";

interface AppStore {
  profile: UserProfile | null;
  stats: UserStats | null;
  setProfile: (profile: UserProfile | null) => void;
  setStats: (stats: UserStats | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  profile: null,
  stats: null,
  setProfile: (profile) => set({ profile }),
  setStats: (stats) => set({ stats }),
}));
