"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, or } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Duel } from "@/types";

export function useRealtimeDuels(uid: string | undefined) {
  const [activeDuels, setActiveDuels] = useState<Duel[]>([]);
  const [pendingDuels, setPendingDuels] = useState<Duel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setActiveDuels([]);
      setPendingDuels([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const db = getFirebaseDb();

    // Listen to duels where user is challenger
    const q1 = query(
      collection(db, "duels"),
      where("challengerId", "==", uid),
    );

    // Listen to duels where user is opponent
    const q2 = query(
      collection(db, "duels"),
      where("opponentId", "==", uid),
    );

    let challengerDuels: Duel[] = [];
    let opponentDuels: Duel[] = [];

    const mergeAndUpdate = () => {
      const all = [...challengerDuels, ...opponentDuels];
      const unique = Array.from(new Map(all.map((d) => [d.id, d])).values());
      const now = Date.now();
      setActiveDuels(unique.filter((d) => d.status === "active" && d.endTime > now));
      setPendingDuels(unique.filter((d) => d.status === "pending"));
      setLoading(false);
    };

    const unsub1 = onSnapshot(q1, (snap) => {
      challengerDuels = snap.docs.map((d) => d.data() as Duel);
      mergeAndUpdate();
    }, (err) => {
      console.error("Realtime duels (challenger) error:", err);
      setLoading(false);
    });

    const unsub2 = onSnapshot(q2, (snap) => {
      opponentDuels = snap.docs.map((d) => d.data() as Duel);
      mergeAndUpdate();
    }, (err) => {
      console.error("Realtime duels (opponent) error:", err);
      setLoading(false);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [uid]);

  return { activeDuels, pendingDuels, loading };
}
