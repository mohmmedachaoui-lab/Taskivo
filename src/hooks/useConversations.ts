"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Conversation } from "@/types";

export function useConversations(uid: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const db = getFirebaseDb();
    const q = query(
      collection(db, "conversations"),
      where("members", "array-contains", uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const convs = snap.docs.map((d) => d.data() as Conversation);
      convs.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
      setConversations(convs);
      setLoading(false);
    });

    return () => unsub();
  }, [uid]);

  return { conversations, loading };
}
