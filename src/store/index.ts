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

interface ChatStore {
  activeConversationId: string | null;
  showDrawer: boolean;
  unreadCount: number;
  setActiveConversation: (id: string | null) => void;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
  setUnreadCount: (count: number) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  activeConversationId: null,
  showDrawer: false,
  unreadCount: 0,
  setActiveConversation: (id) => set({ activeConversationId: id }),
  toggleDrawer: () => set((s) => ({ showDrawer: !s.showDrawer })),
  setDrawerOpen: (open) => set({ showDrawer: open }),
  setUnreadCount: (count) => set({ unreadCount: count }),
}));
