"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Duel } from "@/types";

export function useRealtimeDuels(uid: string | undefined) {
  const [activeDuels, setActiveDuels] = useState<Duel[]>([]);
  const [pendingDuels, setPendingDuels] = useState<Duel[]>([]);
  const [completedDuels, setCompletedDuels] = useState<Duel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setActiveDuels([]);
      setPendingDuels([]);
      setCompletedDuels([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const db = getFirebaseDb();

    const q1 = query(
      collection(db, "duels"),
      where("challengerId", "==", uid),
    );

    const q2 = query(
      collection(db, "duels"),
      where("opponentId", "==", uid),
    );

    const q3 = query(
      collection(db, "duels"),
      where("challengerId", "==", uid),
      where("status", "==", "completed"),
      orderBy("createdAt", "desc"),
      limit(20),
    );

    const q4 = query(
      collection(db, "duels"),
      where("opponentId", "==", uid),
      where("status", "==", "completed"),
      orderBy("createdAt", "desc"),
      limit(20),
    );

    let challengerDuels: Duel[] = [];
    let opponentDuels: Duel[] = [];
    let challengerCompleted: Duel[] = [];
    let opponentCompleted: Duel[] = [];

    const mergeAndUpdate = () => {
      const all = [...challengerDuels, ...opponentDuels];
      const unique = Array.from(new Map(all.map((d) => [d.id, d])).values());
      const now = Date.now();
      setActiveDuels(unique.filter((d) => d.status === "active" && d.endTime > now));
      setPendingDuels(unique.filter((d) => d.status === "pending"));
      setLoading(false);
    };

    const mergeCompleted = () => {
      const all = [...challengerCompleted, ...opponentCompleted];
      const unique = Array.from(new Map(all.map((d) => [d.id, d])).values());
      setCompletedDuels(unique.sort((a, b) => b.createdAt - a.createdAt));
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

    const unsub3 = onSnapshot(q3, (snap) => {
      challengerCompleted = snap.docs.map((d) => d.data() as Duel);
      mergeCompleted();
    }, (err) => {
      console.error("Realtime duels (completed challenger) error:", err);
    });

    const unsub4 = onSnapshot(q4, (snap) => {
      opponentCompleted = snap.docs.map((d) => d.data() as Duel);
      mergeCompleted();
    }, (err) => {
      console.error("Realtime duels (completed opponent) error:", err);
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, [uid]);

  return { activeDuels, pendingDuels, completedDuels, loading };
}
