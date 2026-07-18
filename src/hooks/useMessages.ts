"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ChatMessage } from "@/types";

export function useMessages(
  conversationId: string | undefined,
  messageLimit: number = 100
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const db = getFirebaseDb();
    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("timestamp", "asc"),
      limit(messageLimit)
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => d.data() as ChatMessage);
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsub();
  }, [conversationId, messageLimit]);

  return { messages, loading };
}
