"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

export function useUnreadCount(uid: string | undefined) {
  const [unreadCount, setUnreadCount] = useState(0);

  const recalc = useCallback(async () => {
    if (!uid) {
      setUnreadCount(0);
      return;
    }
    const db = getFirebaseDb();
    const convSnap = await getDocs(
      query(
        collection(db, "conversations"),
        where("members", "array-contains", uid)
      )
    );

    if (convSnap.empty) {
      setUnreadCount(0);
      return;
    }

    const convIds = convSnap.docs.map((d) => d.id);
    const counts = await Promise.all(
      convIds.map(async (convId) => {
        const msgSnap = await getDocs(
          query(
            collection(db, "conversations", convId, "messages"),
            where("read", "==", false),
            where("senderUid", "!=", uid)
          )
        );
        return msgSnap.size;
      })
    );
    setUnreadCount(counts.reduce((a, b) => a + b, 0));
  }, [uid]);

  useEffect(() => {
    recalc();
    const interval = setInterval(recalc, 15000);
    return () => clearInterval(interval);
  }, [recalc]);

  return unreadCount;
}
