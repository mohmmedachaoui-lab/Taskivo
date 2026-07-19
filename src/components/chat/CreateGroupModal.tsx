"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store";
import { useFriends } from "@/hooks/useFriends";
import { createGroupConversation, getUserProfile } from "@/lib/chat";
import { useChatStore } from "@/store";
import { X, Users, Check } from "lucide-react";
import Button from "@/components/ui/Button";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FriendInfo {
  uid: string;
  callsign: string;
  photoURL: string | null;
}

export default function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const { user } = useAuth();
  const profile = useAppStore(s => s.profile);
  const setActiveConversation = useChatStore(s => s.setActiveConversation);
  const setDrawerOpen = useChatStore(s => s.setDrawerOpen);
  const { friendUids } = useFriends(user?.uid);
  const [friendProfiles, setFriendProfiles] = useState<FriendInfo[]>([]);
  const [groupName, setGroupName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isOpen || friendUids.length === 0) return;
    let cancelled = false;
    Promise.all(friendUids.map((uid) => getUserProfile(uid))).then((profiles) => {
      if (cancelled) return;
      setFriendProfiles(
        profiles.filter(Boolean).map((p) => ({
          uid: p!.uid,
          callsign: p!.callsign,
          photoURL: p!.photoURL,
        }))
      );
    });
    return () => { cancelled = true; };
  }, [isOpen, friendUids]);

  const toggleSelect = (uid: string) => {
    setSelected((prev) =>
      prev.includes(uid) ? prev.filter((u) => u !== uid) : [...prev, uid]
    );
  };

  const handleCreate = async () => {
    if (!user || !profile || !groupName.trim() || selected.length === 0) return;
    setCreating(true);
    try {
      const memberCallsigns: Record<string, string> = {};
      memberCallsigns[user.uid] = profile.callsign;
      selected.forEach((uid) => {
        const fp = friendProfiles.find((f) => f.uid === uid);
        memberCallsigns[uid] = fp?.callsign ?? uid.slice(0, 8);
      });

      const convId = await createGroupConversation(
        user.uid,
        profile.callsign,
        selected,
        memberCallsigns,
        groupName.trim()
      );

      setActiveConversation(convId);
      setDrawerOpen(true);
      setGroupName("");
      setSelected([]);
      onClose();
    } catch (err) {
      console.error("Failed to create group:", err);
    }
    setCreating(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.3}
            onDragEnd={(_, info) => {
              if (info.offset.y > 60 || info.velocity.y > 300) {
                onClose();
              }
            }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto z-[60] glass neon-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#a855f7]" />
                <h3 className="text-sm font-semibold text-white font-[family-name:var(--font-mono)]">
                  New Group
                </h3>
              </div>
              <button onClick={onClose} className="p-2 -mr-2 text-gray-500 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name..."
              maxLength={30}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#a855f7]/40 mb-3"
            />

            <p className="text-[10px] text-gray-500 font-[family-name:var(--font-mono)] uppercase tracking-wider mb-2">
              Select friends
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1 mb-4">
              {friendProfiles.length === 0 ? (
                <p className="text-xs text-gray-600 text-center py-4">No friends to add</p>
              ) : (
                friendProfiles.map((friend) => (
                  <button
                    key={friend.uid}
                    onClick={() => toggleSelect(friend.uid)}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#a855f7] to-[#6b21a8] flex items-center justify-center flex-shrink-0">
                      {friend.photoURL ? (
                        <Image src={friend.photoURL} alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
                      ) : (
                        <span className="text-white text-[10px] font-bold">
                          {friend.callsign[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-300 flex-1 text-left truncate">{friend.callsign}</span>
                    {selected.includes(friend.uid) && (
                      <Check className="h-3.5 w-3.5 text-[#a855f7]" />
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={creating || !groupName.trim() || selected.length === 0}
                className="flex-1"
              >
                {creating ? "Creating..." : "Create Group"}
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
