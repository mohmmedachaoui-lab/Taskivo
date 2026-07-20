"use client";

import { useEffect, useState, useRef } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { getFirebaseDb, getFirebaseMessaging } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

export function useFCMNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);
  const lastNotifiedAt = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSupported("Notification" in window && "serviceWorker" in navigator);
    setPermission(Notification.permission);
  }, []);

  const requestPermission = async () => {
    if (!supported || !user) return;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        const messaging = await getFirebaseMessaging();
        if (!messaging) return;

        const { getToken } = await import("firebase/messaging");
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        if (token) {
          const db = getFirebaseDb();
          await updateDoc(doc(db, "users", user.uid), {
            fcmTokens: arrayUnion(token),
          });
        }
      }
    } catch (err) {
      console.error("FCM permission error:", err);
    }
  };

  useEffect(() => {
    if (!user || permission !== "granted") return;

    let unsubscribe: (() => void) | undefined;

    (async () => {
      const messaging = await getFirebaseMessaging();
      if (!messaging) return;

      const { onMessage } = await import("firebase/messaging");
      unsubscribe = onMessage(messaging, (payload) => {
        const now = Date.now();
        if (now - lastNotifiedAt.current < 500) return;
        lastNotifiedAt.current = now;

        if (Notification.permission === "granted") {
          new Notification(payload.notification?.title ?? "Taskivo", {
            body: payload.notification?.body,
            icon: "/favicon.ico",
          });
        }
      });
    })();

    return () => unsubscribe?.();
  }, [user, permission]);

  return { supported, permission, requestPermission };
}
