"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store";
import {
  searchUsers,
  sendFriendRequest,
  getFriends,
  getPendingFriendRequests,
  respondFriendRequest,
  removeFriend,
} from "@/lib/social";
import { getPublicProfiles } from "@/lib/profiles";
import FriendProfileCard from "@/components/friends/FriendProfileCard";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { FriendRequest, FriendProfile } from "@/types";
import {
  Users,
  UserPlus,
  Search,
  Check,
  X,
  UserCheck,
  UserMinus,
  Mail,
  Copy,
  CheckCircle2,
} from "lucide-react";

type Tab = "friends" | "requests" | "search";

export default function FriendsPage() {
  const { user } = useAuth();
  const { profile } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>("friends");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<
    { uid: string; callsign: string; friendCode: string; photoURL: string | null; level: number; requestSent?: boolean }[]
  >([]);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileUid, setProfileUid] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<FriendProfile | null>(null);
  const [removing, setRemoving] = useState(false);

  const loadFriends = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const friendUids = await getFriends(user.uid);
      const profiles = await getPublicProfiles(friendUids);
      setFriends(
        profiles.map((p) => ({
          uid: p.uid,
          callsign: p.callsign,
          friendCode: p.friendCode,
          photoURL: p.photoURL,
          level: p.level,
          totalXP: p.totalXP,
          tasksCompleted: 0,
          duelsWon: 0,
          achievements: [],
          currentStreak: 0,
        }))
      );

      const pending = await getPendingFriendRequests(user.uid);
      setRequests(pending);
    } catch (err) {
      console.error("Failed to load friends:", err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  const handleRemoveFriend = async () => {
    if (!user || !removeTarget) return;
    setRemoving(true);
    try {
      const result = await removeFriend(user.uid, removeTarget.uid);
      if (result === "removed") {
        setFriends((prev) => prev.filter((f) => f.uid !== removeTarget.uid));
      }
    } catch (err) {
      console.error("Failed to remove friend:", err);
    }
    setRemoving(false);
    setRemoveTarget(null);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await searchUsers(searchTerm);
      setSearchResults(
        results
          .filter((r) => r.uid !== user?.uid)
          .map((r) => ({ ...r, friendCode: "" }))
      );
    } catch (err) {
      console.error("Search failed:", err);
    }
    setSearching(false);
  };

  const handleSendRequest = async (targetUid: string) => {
    if (!user || !profile) return;
    const result = await sendFriendRequest(user.uid, profile.callsign, profile.photoURL, targetUid);
    setSearchResults((prev) =>
      prev.map((r) =>
        r.uid === targetUid ? { ...r, requestSent: result === "sent" } : r
      )
    );
  };

  const handleRespond = async (requestId: string, accept: boolean) => {
    await respondFriendRequest(requestId, accept);
    loadFriends();
  };

  const copyFriendCode = () => {
    if (profile?.friendCode) {
      navigator.clipboard.writeText(profile.friendCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const pendingCount = requests.length;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "friends", label: "Friends", count: friends.length },
    { id: "requests", label: "Requests", count: pendingCount },
    { id: "search", label: "Find" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-mono)] tracking-tight">
          <span className="text-[#a855f7]">&gt;</span> Social
        </h1>
        <p className="text-gray-500 mt-0.5 text-xs font-[family-name:var(--font-mono)] uppercase tracking-widest">
          Connect with other Taskivo agents
        </p>
      </div>

      {/* Friend Code Display */}
      {profile?.friendCode && (
        <Card className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-500 font-[family-name:var(--font-mono)] uppercase tracking-widest mb-1">
              Your Friend Code
            </p>
            <p className="text-base font-bold text-[#a855f7] font-[family-name:var(--font-mono)] tracking-wide">
              {profile.friendCode}
            </p>
          </div>
          <button
            onClick={copyFriendCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#a855f7]/8 border border-[#a855f7]/20 text-[#a855f7] hover:bg-[#a855f7]/15 transition-all text-xs font-[family-name:var(--font-mono)]"
          >
            {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#a855f7]/10 text-[#a855f7] font-[family-name:var(--font-mono)]">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search (always visible in Search tab, or inline in Friends tab) */}
      {activeTab === "search" && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder='Search callsign or "Agent#4821"...'
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#a855f7]/40 transition-all"
            />
          </div>
          <Button onClick={handleSearch} disabled={searching} className="bg-[#a855f7]/15 border border-[#a855f7]/30 text-[#a855f7] hover:bg-[#a855f7]/25">
            {searching ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#a855f7] border-t-transparent" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* Search Results */}
      <AnimatePresence>
        {activeTab === "search" && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-[10px] text-gray-500 font-[family-name:var(--font-mono)] uppercase tracking-widest mb-2">
              Results
            </p>
            <div className="space-y-2">
              {searchResults.map((result) => (
                <Card key={result.uid} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#6b21a8] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {result.callsign[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{result.callsign}</p>
                    <p className="text-xs text-gray-500 font-[family-name:var(--font-mono)]">
                      Level {result.level}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSendRequest(result.uid)}
                    className="gap-1 bg-[#a855f7]/10 border border-[#a855f7]/20 text-[#a855f7] hover:bg-[#a855f7]/20"
                  >
                    <UserPlus className="h-3 w-3" /> Add
                  </Button>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Content */}
      {activeTab === "friends" && (
        <div>
          {friends.length === 0 && !loading ? (
            <EmptyState
              icon={<Users className="h-8 w-8" strokeWidth={2.5} />}
              title="No squad members yet"
              description="Your network is your net worth. Find other agents and build your crew."
              accent="#a855f7"
              actionLabel="Find Agents"
              onAction={() => setActiveTab("search")}
            />
          ) : (
            <div className="space-y-2">
              {[...friends]
                .sort((a, b) => b.totalXP - a.totalXP)
                .map((friend) => (
                  <motion.div
                    key={friend.uid}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card
                      hover
                      className="flex items-center gap-4 cursor-pointer"
                      onClick={() => setProfileUid(friend.uid)}
                    >
                      <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#6b21a8] flex items-center justify-center flex-shrink-0">
                        {friend.photoURL ? (
                          <img
                            src={friend.photoURL}
                            alt={friend.callsign}
                            className="h-10 w-10 rounded-xl object-cover"
                          />
                        ) : (
                          <span className="text-white text-sm font-bold">
                            {friend.callsign[0]?.toUpperCase()}
                          </span>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#10b981] border-2 border-[#050508]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{friend.callsign}</p>
                        <p className="text-xs text-gray-500 font-[family-name:var(--font-mono)]">
                          Lvl {friend.level} · {friend.totalXP.toLocaleString()} XP
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileUid(friend.uid);
                          }}
                          className="p-1.5 rounded-lg hover:bg-white/[0.04] text-gray-500 hover:text-[#a855f7] transition-colors"
                          title="Profile"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRemoveTarget(friend);
                          }}
                          className="p-1.5 rounded-lg hover:bg-white/[0.04] text-gray-500 hover:text-[#ef4444] transition-colors"
                          title="Remove friend"
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "requests" && (
        <div>
          {requests.length === 0 ? (
            <EmptyState
              icon={<Mail className="h-8 w-8" strokeWidth={2.5} />}
              title="No pending requests"
              description="When someone sends you a friend request, it will appear here."
              accent="#a855f7"
            />
          ) : (
            <div className="space-y-2">
              {requests.map((req) => (
                <Card key={req.id} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#6b21a8] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {req.fromCallsign[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{req.fromCallsign}</p>
                    <p className="text-xs text-gray-500">Wants to be your friend</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleRespond(req.id, true)}
                      className="bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] hover:bg-[#10b981]/20"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleRespond(req.id, false)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Friend Profile Modal */}
      <AnimatePresence>
        {profileUid && (
          <FriendProfileCard
            uid={profileUid}
            onClose={() => setProfileUid(null)}
          />
        )}
      </AnimatePresence>

      {/* Remove Friend Confirmation */}
      <ConfirmModal
        open={!!removeTarget}
        title="Remove Friend"
        message={`Remove ${removeTarget?.callsign ?? "this agent"} from your squad? You can add them again later.`}
        confirmLabel="Remove"
        danger
        loading={removing}
        onConfirm={handleRemoveFriend}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
