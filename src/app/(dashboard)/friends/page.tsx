"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store";
import {
  searchUsers,
  sendFriendRequest,
  getFriends,
  getPendingFriendRequests,
  respondFriendRequest,
} from "@/lib/social";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import {
  Users,
  UserPlus,
  Search,
  Check,
  X,
  UserCheck,
  Mail,
} from "lucide-react";

interface FriendProfile {
  uid: string;
  callsign: string;
  photoURL: string | null;
  level: number;
  totalXP: number;
}

export default function FriendsPage() {
  const { user } = useAuth();
  const { profile } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<
    { uid: string; callsign: string; photoURL: string | null; level: number }[]
  >([]);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const loadFriends = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const friendUids = await getFriends(user.uid);
      const profiles = await Promise.all(
        friendUids.map(async (uid) => {
          const snap = await getDoc(doc(getFirebaseDb(), "users", uid));
          if (snap.exists()) {
            const d = snap.data();
            return {
              uid: d.uid,
              callsign: d.callsign,
              photoURL: d.photoURL,
              level: d.level ?? 1,
              totalXP: d.totalXP ?? 0,
            };
          }
          return null;
        })
      );
      setFriends(profiles.filter(Boolean) as FriendProfile[]);

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

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await searchUsers(searchTerm);
      setSearchResults(results.filter((r) => r.uid !== user?.uid));
    } catch (err) {
      console.error("Search failed:", err);
    }
    setSearching(false);
  };

  const handleSendRequest = async (targetUid: string) => {
    if (!user || !profile) return;
    const result = await sendFriendRequest(
      user.uid,
      profile.callsign,
      profile.photoURL,
      targetUid
    );
    if (result === "sent") {
      setSearchResults((prev) =>
        prev.map((r) =>
          r.uid === targetUid ? { ...r, requestSent: true } : r
        )
      );
    }
  };

  const handleRespond = async (requestId: string, accept: boolean) => {
    await respondFriendRequest(requestId, accept);
    loadFriends();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-mono)] tracking-tight"><span className="text-[#00d4ff]">&gt;</span> Social</h1>
        <p className="text-gray-500 mt-0.5 text-xs font-[family-name:var(--font-mono)] uppercase tracking-widest">Connect with other Taskivo agents</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by callsign..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <Button onClick={handleSearch} disabled={searching}>
          {searching ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              Search Results
            </h3>
            <div className="space-y-2">
              {searchResults.map((result) => (
                <Card key={result.uid} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm font-bold">
                    {result.callsign[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {result.callsign}
                    </p>
                    <p className="text-xs text-gray-500">Level {result.level}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSendRequest(result.uid)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {requests.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Pending Requests ({requests.length})
          </h3>
          <div className="space-y-2">
            {requests.map((req) => (
              <Card key={req.id} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-bold">
                  {req.fromCallsign[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {req.fromCallsign}
                  </p>
                  <p className="text-xs text-gray-500">Wants to be your friend</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleRespond(req.id, true)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleRespond(req.id, false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          Your Friends ({friends.length})
        </h3>
        {friends.length === 0 && !loading ? (
          <Card className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No friends yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Search and add friends to compete together
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <motion.div
                key={friend.uid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm font-bold">
                    {friend.callsign[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {friend.callsign}
                    </p>
                    <p className="text-xs text-gray-500">
                      Level {friend.level} &middot;{" "}
                      {friend.totalXP.toLocaleString()} XP
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
