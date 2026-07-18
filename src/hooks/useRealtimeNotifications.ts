"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, query, where, orderBy, limit, onSnapshot, updateDoc, doc, getDocs } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Notification } from "@/types";

export function useRealtimeNotifications(uid: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const db = getFirebaseDb();
    const q = query(
      collection(db, "notifications"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => d.data() as Notification);
      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.read).length);
      setLoading(false);
    }, (err) => {
      console.error("Realtime notifications error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [uid]);

  const markRead = useCallback(async (notificationId: string) => {
    const db = getFirebaseDb();
    await updateDoc(doc(db, "notifications", notificationId), { read: true });
  }, []);

  const markAllRead = useCallback(async () => {
    if (!uid) return;
    const db = getFirebaseDb();
    const q = query(
      collection(db, "notifications"),
      where("uid", "==", uid),
      where("read", "==", false)
    );
    const snap = await getDocs(q);
    const batch = snap.docs.map((d) => updateDoc(d.ref, { read: true }));
    await Promise.all(batch);
  }, [uid]);

  return { notifications, unreadCount, loading, markRead, markAllRead };
}

// Global singleton for cross-component notification state
let globalUnreadCount = 0;
let globalListeners: ((count: number) => void)[] = [];

export function subscribeToUnreadCount(callback: (count: number) => void) {
  globalListeners.push(callback);
  callback(globalUnreadCount);
  return () => {
    globalListeners = globalListeners.filter((l) => l !== callback);
  };
}

export function updateGlobalUnreadCount(count: number) {
  globalUnreadCount = count;
  globalListeners.forEach((l) => l(count));
}
