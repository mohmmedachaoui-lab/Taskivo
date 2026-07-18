"use client";

import { useState, useEffect } from "react";

export function useCurrentTime(intervalMs: number = 60000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
