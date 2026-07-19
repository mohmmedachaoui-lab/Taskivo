"use client";

import { useState, useEffect, useRef } from "react";

export function useOnlineStatus() {
  const [online, setOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setOnline(navigator.onLine);

    const handleOffline = () => {
      setOnline(false);
      setWasOffline(true);
    };

    const handleOnline = () => {
      setOnline(true);
      if (wasOffline) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setWasOffline(false), 3000);
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [wasOffline]);

  return { online, wasOffline };
}
