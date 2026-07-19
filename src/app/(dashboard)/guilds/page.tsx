"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  getGuildMembers,
  getGuildNews,
  kickMember,
} from "@/lib/social";
import { Guild, GuildNews } from "@/types";
import {
  Gamepad2,
  Plus,
  Users,
  Zap,
  Crown,
  LogOut,
  Trash2,
  Trophy,
  Newspaper,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export default function GuildsPage() {
  const { user } = useAuth();
  const { profile } = useAppStore();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [myGuild, setMyGuild] = useState<Guild | null>(null);
  const [guildMembers, setGuildMembers] = useState<{ uid: string; callsign: string; totalXP: number; level: number }[]>([]);
  const [guildNews, setGuildNews] = useState<GuildNews[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showMembers, setShowMembers] = useState(true);
  const [showNews, setShowNews] = useState(true);

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

      if (userGuild) {
        const [members, news] = await Promise.all([
          getGuildMembers(userGuild.members),
          getGuildNews(userGuild.id),
        ]);
        setGuildMembers(members);
        setGuildNews(news);
      }
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
      await createGuild(user.uid, newName, newDesc, profile?.callsign ?? "Owner");
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
    await joinGuild(user.uid, guildId, profile?.callsign ?? "New Member");
    await loadData();
  };

  const handleLeave = async () => {
    if (!user || !myGuild) return;
    await leaveGuild(user.uid, myGuild.id, profile?.callsign ?? "Member");
    await loadData();
  };

  const handleKick = async (targetUid: string, targetCallsign: string) => {
    if (!user || !myGuild) return;
    if (!confirm(`Kick ${targetCallsign} from the guild?`)) return;
    await kickMember(user.uid, myGuild.id, targetUid, targetCallsign);
    await loadData();
  };

  const isOwner = user && myGuild && myGuild.ownerId === user.uid;
  const guildRank = guilds.findIndex((g) => g.id === myGuild?.id) + 1;

  const getNewsIcon = (type: GuildNews["type"]) => {
    switch (type) {
      case "join": return <Users className="h-3.5 w-3.5 text-green-400" />;
      case "leave": return <LogOut className="h-3.5 w-3.5 text-gray-400" />;
      case "kick": return <Trash2 className="h-3.5 w-3.5 text-red-400" />;
      case "milestone": return <Trophy className="h-3.5 w-3.5 text-yellow-400" />;
      default: return <Newspaper className="h-3.5 w-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-mono)] tracking-tight"><span className="text-[#00d4ff]">&gt;</span> Guilds</h1>
          <p className="text-gray-500 mt-0.5 text-xs font-[family-name:var(--font-mono)] uppercase tracking-widest">Join a guild, compete as a team, climb the leaderboard</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Guild
        </Button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Guild Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Code Warriors"
                    maxLength={30}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Description</label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="What's your guild about?"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
                    {creating ? "Creating..." : "Create"}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {myGuild && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-500" />
            Your Guild
          </h3>

          <Card className="border-[#00d4ff]/20 bg-[#00d4ff]/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#00d4ff]/20">
                {myGuild.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-xl">{myGuild.name}</h3>
                  {guildRank > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 font-medium">
                      #{guildRank} Global
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{myGuild.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Users className="h-3 w-3" /> {myGuild.memberCount} members
                  </span>
                  <span className="text-xs text-[#00d4ff] flex items-center gap-1">
                    <Zap className="h-3 w-3" /> {myGuild.totalXP.toLocaleString()} XP
                  </span>
                </div>
              </div>
              {isOwner ? (
                <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 font-medium flex items-center gap-1">
                  <Crown className="h-3 w-3" /> Owner
                </span>
              ) : (
                <Button variant="danger" size="sm" onClick={handleLeave} className="gap-1">
                  <LogOut className="h-3.5 w-3.5" /> Leave
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <button
                  onClick={() => setShowMembers(!showMembers)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors w-full mb-2"
                >
                  <Users className="h-4 w-4" /> Members ({guildMembers.length})
                  {showMembers ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
                </button>
                <AnimatePresence>
                  {showMembers && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {[...guildMembers]
                        .sort((a, b) => b.totalXP - a.totalXP)
                        .map((member, i) => (
                        <div
                          key={member.uid}
                          className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                        >
                          <span className="text-xs text-gray-500 w-4">#{i + 1}</span>
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#00d4ff] to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                            {member.callsign[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{member.callsign}</p>
                            <p className="text-xs text-gray-500">Lvl {member.level}</p>
                          </div>
                          <span className="text-xs text-[#00d4ff]">{member.totalXP.toLocaleString()} XP</span>
                          {isOwner && member.uid !== user?.uid && (
                            <button
                              onClick={() => handleKick(member.uid, member.callsign)}
                              className="text-gray-500 hover:text-red-400 transition-colors p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <button
                  onClick={() => setShowNews(!showNews)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors w-full mb-2"
                >
                  <Newspaper className="h-4 w-4" /> Guild News
                  {showNews ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
                </button>
                <AnimatePresence>
                  {showNews && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {guildNews.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-4">No news yet</p>
                      ) : (
                        guildNews.map((news) => (
                          <div
                            key={news.id}
                            className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/30"
                          >
                            {getNewsIcon(news.type)}
                            <p className="text-sm text-gray-300 flex-1">{news.message}</p>
                            <span className="text-[10px] text-gray-600 whitespace-nowrap">
                              {new Date(news.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Guild Leaderboard
          </h3>
          <span className="text-xs text-gray-600">{guilds.length} guilds</span>
        </div>
        {loading ? (
          <Card className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00d4ff] border-t-transparent" />
          </Card>
        ) : guilds.length === 0 ? (
          <EmptyState
            icon={<Gamepad2 className="h-8 w-8" strokeWidth={2.5} />}
            title="No guilds found"
            description="Be the pioneer. Create a guild and recruit agents to climb the leaderboard together."
            accent="#a855f7"
            actionLabel="Create First Guild"
            onAction={() => setShowCreate(true)}
          />
        ) : (
          <div className="space-y-2">
            {guilds.map((guild, i) => {
              const isMember = myGuild?.id === guild.id;
              const medals = ["text-yellow-400", "text-gray-300", "text-orange-400"];
              return (
                <motion.div
                  key={guild.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    hover
                    className={`flex items-center gap-4 ${isMember ? "border-[#00d4ff]/30 bg-[#00d4ff]/5" : ""}`}
                  >
                    <span className={`text-sm font-bold w-6 text-center ${i < 3 ? medals[i] : "text-gray-600"}`}>
                      {i + 1}
                    </span>
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {guild.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{guild.name}</h3>
                        {isMember && <span className="text-[10px] text-[#00d4ff]">YOUR GUILD</span>}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{guild.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="h-3 w-3" /> {guild.memberCount}
                      </span>
                      <span className="text-sm text-[#00d4ff] font-semibold flex items-center gap-1">
                        <Zap className="h-3 w-3" /> {guild.totalXP.toLocaleString()}
                      </span>
                      {!isMember && !myGuild && (
                        <Button size="sm" onClick={() => handleJoin(guild.id)}>Join</Button>
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
