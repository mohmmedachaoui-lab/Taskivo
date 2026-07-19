"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getCompletedDuels, settleDuelSide, resolveDuel } from "@/lib/social";

export function useSettleDuels() {
  const { user } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (!user || ran.current) return;
    ran.current = true;

    const settle = async () => {
      try {
        const completed = await getCompletedDuels(user.uid);

        const needsResolve = completed.filter(
          (d) => d.status !== "completed"
        );
        for (const duel of needsResolve) {
          await resolveDuel(duel.id);
        }

        const allCompleted = needsResolve.length > 0
          ? await getCompletedDuels(user.uid)
          : completed;

        await Promise.all(
          allCompleted.map((d) => settleDuelSide(d.id, user.uid))
        );
      } catch {
        // Silent — will retry on next mount
      }
    };

    settle();
  }, [user]);
}
