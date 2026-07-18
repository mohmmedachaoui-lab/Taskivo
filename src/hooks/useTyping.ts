"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  onSnapshot,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { TypingDoc } from "@/types";
import { setTyping } from "@/lib/chat";

interface TypingState {
  [uid: string]: TypingDoc;
}

export function useTyping(
  conversationId: string | undefined,
  currentUid: string | undefined
) {
  const [typers, setTypers] = useState<TypingState>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!conversationId) {
      setTypers({});
      return;
    }

    const db = getFirebaseDb();
    const q = query(
      collection(db, "conversations", conversationId, "typing")
    );

    const unsub = onSnapshot(q, (snap) => {
      const state: TypingState = {};
      const now = Date.now();
      snap.docs.forEach((d) => {
        const data = d.data() as TypingDoc;
        if (d.id !== currentUid && data.isTyping && now - data.updatedAt < 5000) {
          state[d.id] = data;
        }
      });
      setTypers(state);
    });

    return () => unsub();
  }, [conversationId, currentUid]);

  const startTyping = useCallback(() => {
    if (!conversationId || !currentUid) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      setTyping(conversationId, currentUid, true);
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      setTyping(conversationId, currentUid, false);
    }, 3000);
  }, [conversationId, currentUid]);

  const stopTyping = useCallback(() => {
    if (!conversationId || !currentUid) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    isTypingRef.current = false;
    setTyping(conversationId, currentUid, false);
  }, [conversationId, currentUid]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (conversationId && currentUid) {
        setTyping(conversationId, currentUid, false);
      }
    };
  }, [conversationId, currentUid]);

  return { typers, startTyping, stopTyping };
}
