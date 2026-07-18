"use client";

import { ChatMessage } from "@/types";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { clsx } from "clsx";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showSender: boolean;
}

export default function MessageBubble({ message, isOwn, showSender }: MessageBubbleProps) {
  const now = useCurrentTime(60000);
  const timeAgo = (() => {
    const diff = now - message.timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  })();

  return (
    <div className={clsx("flex flex-col max-w-[75%] group", isOwn ? "self-end items-end" : "self-start items-start")}>
      {showSender && !isOwn && (
        <span className="text-[9px] text-[#a855f7] font-[family-name:var(--font-mono)] uppercase tracking-wider mb-0.5 px-1">
          {message.senderCallsign}
        </span>
      )}
      <div
        className={clsx(
          "relative px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed transition-all",
          isOwn
            ? "bg-gradient-to-br from-[#a855f7]/15 to-[#a855f7]/8 border border-[#a855f7]/20 text-gray-100 rounded-br-md"
            : "bg-white/[0.03] border border-white/[0.06] text-gray-300 rounded-bl-md"
        )}
      >
        {message.text}
      </div>
      <span className="text-[8px] text-gray-600 font-[family-name:var(--font-mono)] mt-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {timeAgo}
      </span>
    </div>
  );
}
