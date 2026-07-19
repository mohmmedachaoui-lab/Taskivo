"use client";

import { useState, useEffect, useRef } from "react";

export function useSkeletonTimeout(
  isLoading: boolean,
  timeoutMs: number = 12000
): { timedOut: boolean; reset: () => void } {
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoading && !timedOut) {
      timerRef.current = setTimeout(() => setTimedOut(true), timeoutMs);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoading, timedOut, timeoutMs]);

  const reset = () => {
    setTimedOut(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return { timedOut, reset };
}
