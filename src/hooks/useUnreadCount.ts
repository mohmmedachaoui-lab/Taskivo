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

    let total = 0;
    for (const convDoc of convSnap.docs) {
      const msgSnap = await getDocs(
        query(
          collection(db, "conversations", convDoc.id, "messages"),
          where("read", "==", false)
        )
      );
      total += msgSnap.docs.filter((d) => d.data().senderUid !== uid).length;
    }
    setUnreadCount(total);
  }, [uid]);

  useEffect(() => {
    recalc();
    const interval = setInterval(recalc, 15000);
    return () => clearInterval(interval);
  }, [recalc]);

  return unreadCount;
}
