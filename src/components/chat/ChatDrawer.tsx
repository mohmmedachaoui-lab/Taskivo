"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore, useChatStore } from "@/store";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { useTyping } from "@/hooks/useTyping";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { sendMessage, markMessagesRead } from "@/lib/chat";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import CreateGroupModal from "./CreateGroupModal";
import { clsx } from "clsx";
import {
  MessageSquare,
  X,
  Send,
  Users,
  Plus,
  ArrowLeft,
} from "lucide-react";

export default function ChatDrawer() {
  const { user } = useAuth();
  const { profile } = useAppStore();
  const { showDrawer, setDrawerOpen, activeConversationId, setActiveConversation } = useChatStore();
  const { conversations } = useConversations(user?.uid);
  const { messages } = useMessages(activeConversationId ?? undefined);
  const { typers, startTyping, stopTyping } = useTyping(
    activeConversationId ?? undefined,
    user?.uid
  );
  const unreadCount = useUnreadCount(user?.uid);
  const now = useCurrentTime(60000);

  const [input, setInput] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activeConversationId && user?.uid) {
      markMessagesRead(activeConversationId, user.uid);
    }
  }, [activeConversationId, user?.uid]);

  useEffect(() => {
    if (showDrawer && activeConversationId) {
      inputRef.current?.focus();
    }
  }, [showDrawer, activeConversationId]);

  const handleSend = async () => {
    if (!input.trim() || !user || !profile || !activeConversationId) return;
    const text = input;
    setInput("");
    stopTyping();
    await sendMessage(activeConversationId, user.uid, profile.callsign, text);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    startTyping();
  };

  const getOtherName = (conv: (typeof conversations)[0]) => {
    if (!user) return "Unknown";
    if (conv.type === "group") return conv.groupName ?? "Group";
    const otherUid = conv.members.find((m) => m !== user.uid);
    return otherUid ? conv.memberCallsigns?.[otherUid] ?? "Agent" : "Agent";
  };

  const typingNames = Object.keys(typers)
    .map((uid) => activeConv?.memberCallsigns?.[uid] ?? "Someone")
    .filter(Boolean);

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-40 h-12 w-12 rounded-full bg-gradient-to-br from-[#a855f7] to-[#6b21a8] flex items-center justify-center shadow-lg shadow-[#a855f7]/20 hover:shadow-[#a855f7]/40 transition-all duration-300 hover:scale-105"
      >
        <MessageSquare className="h-5 w-5 text-white" strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[9px] text-white flex items-center justify-center font-bold font-[family-name:var(--font-mono)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => {
                setDrawerOpen(false);
                setActiveConversation(null);
              }}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col"
              style={{
                background: "rgba(5, 5, 8, 0.98)",
                borderLeft: "1px solid rgba(168, 85, 247, 0.1)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                {activeConversationId ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveConversation(null)}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {activeConv ? getOtherName(activeConv) : "Chat"}
                      </p>
                      {activeConv?.type === "group" && (
                        <p className="text-[9px] text-gray-500 font-[family-name:var(--font-mono)]">
                          {activeConv.members.length} members
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[#a855f7]" />
                    <h3 className="text-sm font-semibold text-white font-[family-name:var(--font-mono)]">
                      Messages
                    </h3>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {!activeConversationId && (
                    <button
                      onClick={() => setShowGroupModal(true)}
                      className="p-1.5 rounded-lg hover:bg-white/[0.04] text-gray-500 hover:text-[#a855f7] transition-colors"
                      title="New Group"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      setActiveConversation(null);
                    }}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              {!activeConversationId ? (
                <div className="flex-1 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                      <MessageSquare className="h-10 w-10 text-gray-700 mb-3" />
                      <p className="text-sm text-gray-500">No conversations yet</p>
                      <p className="text-[10px] text-gray-600 mt-1">
                        Add friends and start chatting
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/[0.04]">
                      {conversations.map((conv) => {
                        const name = getOtherName(conv);
                        return (
                          <button
                            key={conv.id}
                            onClick={() => setActiveConversation(conv.id)}
                            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
                          >
                            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#6b21a8] flex items-center justify-center flex-shrink-0">
                              {conv.type === "group" ? (
                                <Users className="h-5 w-5 text-white" />
                              ) : (
                                <span className="text-white text-sm font-bold">
                                  {name[0]?.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-white truncate">{name}</p>
                                {conv.type === "group" && (
                                  <span className="text-[8px] text-[#a855f7] font-[family-name:var(--font-mono)]">
                                    GRP
                                  </span>
                                )}
                              </div>
                              {conv.lastMessage && (
                                <p className="text-[11px] text-gray-500 truncate">
                                  {conv.lastMessage}
                                </p>
                              )}
                            </div>
                            {conv.lastMessageAt && (
                              <span className="text-[9px] text-gray-600 font-[family-name:var(--font-mono)] shrink-0">
                                {(() => {
                                  const diff = now - conv.lastMessageAt;
                                  const mins = Math.floor(diff / 60000);
                                  if (mins < 1) return "now";
                                  if (mins < 60) return `${mins}m`;
                                  const hours = Math.floor(mins / 60);
                                  if (hours < 24) return `${hours}h`;
                                  return `${Math.floor(hours / 24)}d`;
                                })()}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                    {messages.map((msg, i) => {
                      const isOwn = msg.senderUid === user?.uid;
                      const prevMsg = messages[i - 1];
                      const showSender = !prevMsg || prevMsg.senderUid !== msg.senderUid;
                      return (
                        <MessageBubble
                          key={msg.id}
                          message={msg}
                          isOwn={isOwn}
                          showSender={showSender}
                        />
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <AnimatePresence>
                    {typingNames.length > 0 && (
                      <TypingIndicator names={typingNames} />
                    )}
                  </AnimatePresence>

                  <div className="px-3 py-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#a855f7]/40 focus:ring-1 focus:ring-[#a855f7]/20 transition-all"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className={clsx(
                          "p-2.5 rounded-xl transition-all",
                          input.trim()
                            ? "bg-[#a855f7]/15 border border-[#a855f7]/30 text-[#a855f7] hover:bg-[#a855f7]/25"
                            : "bg-white/[0.02] border border-white/[0.04] text-gray-600"
                        )}
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CreateGroupModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
      />
    </>
  );
}
