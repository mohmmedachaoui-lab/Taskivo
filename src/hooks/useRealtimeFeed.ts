"use client";

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ActivityFeedItem } from "@/types";

export function useRealtimeFeed(uid: string | undefined, friendUids: string[]) {
  const [feed, setFeed] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setFeed([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const db = getFirebaseDb();
    const allUids = [uid, ...friendUids].slice(0, 10); // Firestore `in` limit

    if (allUids.length === 0) {
      setFeed([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "activityFeed"),
      where("uid", "in", allUids),
      orderBy("createdAt", "desc"),
      limit(30)
    );

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => d.data() as ActivityFeedItem);
      setFeed(items);
      setLoading(false);
    }, (err) => {
      console.error("Realtime feed error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [uid, friendUids.join(",")]);

  return { feed, loading };
}
