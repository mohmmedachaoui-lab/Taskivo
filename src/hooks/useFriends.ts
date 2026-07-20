"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

export function useFriends(uid: string | undefined) {
  const [friendUids, setFriendUids] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setFriendUids([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const db = getFirebaseDb();

    const q1 = query(collection(db, "friendships"), where("uid1", "==", uid));
    const q2 = query(collection(db, "friendships"), where("uid2", "==", uid));

    let friends1: string[] = [];
    let friends2: string[] = [];

    const merge = () => {
      const all = [...new Set([...friends1, ...friends2])];
      setFriendUids(all);
      setLoading(false);
    };

    const unsub1 = onSnapshot(q1, (snap) => {
      friends1 = snap.docs.map((d) => d.data().uid2);
      merge();
    }, (err) => {
      console.error("Friends (uid1) error:", err);
      setLoading(false);
    });

    const unsub2 = onSnapshot(q2, (snap) => {
      friends2 = snap.docs.map((d) => d.data().uid1);
      merge();
    }, (err) => {
      console.error("Friends (uid2) error:", err);
      setLoading(false);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [uid]);

  return { friendUids, loading };
}
