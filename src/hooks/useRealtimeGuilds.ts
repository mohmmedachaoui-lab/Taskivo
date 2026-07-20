"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Guild } from "@/types";

export function useRealtimeGuilds() {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirebaseDb();
    const q = query(
      collection(db, "guilds"),
      orderBy("totalXP", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setGuilds(snap.docs.map((d) => d.data() as Guild));
      setLoading(false);
    }, (err) => {
      console.error("Realtime guilds error:", err);
      setLoading(false);
    });

    return unsub;
  }, []);

  return { guilds, loading };
}
