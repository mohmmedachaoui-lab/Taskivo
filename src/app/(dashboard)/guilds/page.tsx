"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store";
import {
  createGuild,
  joinGuild,
  leaveGuild,
  getGuilds,
  getUserGuild,
} from "@/lib/social";
import { Guild } from "@/types";
import { Gamepad2, Plus, Users, Zap, Crown, LogOut } from "lucide-react";

export default function GuildsPage() {
  const { user } = useAuth();
  const { profile } = useAppStore();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [myGuild, setMyGuild] = useState<Guild | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [allGuilds, userGuild] = await Promise.all([
        getGuilds(),
        getUserGuild(user.uid),
      ]);
      setGuilds(allGuilds);
      setMyGuild(userGuild);
    } catch (err) {
      console.error("Failed to load guilds:", err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    if (!user || !newName.trim()) return;
    setCreating(true);
    try {
      await createGuild(user.uid, newName, newDesc);
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
      await loadData();
    } catch (err) {
      console.error("Failed to create guild:", err);
    }
    setCreating(false);
  };

  const handleJoin = async (guildId: string) => {
    if (!user) return;
    await joinGuild(user.uid, guildId);
    await loadData();
  };

  const handleLeave = async () => {
    if (!user || !myGuild) return;
    await leaveGuild(user.uid, myGuild.id);
    await loadData();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Gamepad2 className="h-8 w-8 text-purple-500" />
            Guilds
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Join a guild and compete as a team
          </p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Guild
        </Button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Guild Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Code Warriors"
                  maxLength={30}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What's your guild about?"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
                  {creating ? "Creating..." : "Create"}
                </Button>
                <Button variant="ghost" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {myGuild && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-500" />
            Your Guild
          </h3>
          <Card className="border-blue-500/20 bg-blue-500/5">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {myGuild.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  {myGuild.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {myGuild.description}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Users className="h-3 w-3" /> {myGuild.memberCount} members
                  </span>
                  <span className="text-xs text-purple-500 flex items-center gap-1">
                    <Zap className="h-3 w-3" /> {myGuild.totalXP.toLocaleString()} XP
                  </span>
                </div>
              </div>
              {myGuild.ownerId !== user?.uid && (
                <Button variant="danger" size="sm" onClick={handleLeave} className="gap-1">
                  <LogOut className="h-3.5 w-3.5" />
                  Leave
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          All Guilds
        </h3>
        {loading ? (
          <Card className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </Card>
        ) : guilds.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-12">
            <Gamepad2 className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No guilds yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Be the first to create a guild
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guilds.map((guild, i) => {
              const isMember = myGuild?.id === guild.id;
              return (
                <motion.div
                  key={guild.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card
                    hover
                    className={isMember ? "ring-1 ring-blue-500/30" : ""}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        {guild.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {guild.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {guild.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Users className="h-3 w-3" /> {guild.memberCount}
                        </span>
                        <span className="text-xs text-purple-500 flex items-center gap-1">
                          <Zap className="h-3 w-3" />{" "}
                          {guild.totalXP.toLocaleString()}
                        </span>
                      </div>
                      {!isMember && !myGuild && (
                        <Button size="sm" onClick={() => handleJoin(guild.id)}>
                          Join
                        </Button>
                      )}
                      {isMember && (
                        <span className="text-xs text-blue-500 font-medium">
                          Joined
                        </span>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
