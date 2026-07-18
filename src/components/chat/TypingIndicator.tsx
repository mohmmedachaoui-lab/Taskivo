"use client";

import { motion } from "framer-motion";

interface TypingIndicatorProps {
  names: string[];
}

export default function TypingIndicator({ names }: TypingIndicatorProps) {
  if (names.length === 0) return null;

  let label: string;
  if (names.length === 1) {
    label = `${names[0]} is typing`;
  } else if (names.length === 2) {
    label = `${names[0]} and ${names[1]} are typing`;
  } else {
    label = `${names[0]} and ${names.length - 1} others are typing`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="flex items-center gap-2 px-4 py-1.5"
    >
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1 w-1 rounded-full bg-[#a855f7]"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
      <span className="text-[10px] text-gray-500 font-[family-name:var(--font-mono)]">
        {label}
      </span>
    </motion.div>
  );
}
