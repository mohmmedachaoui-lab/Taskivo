"use client";

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

export interface RealtimeTask {
  id: string;
  title: string;
  category: string;
  total: number;
  completed: number;
  urgent: boolean;
  difficulty: string;
  deadline: number | null;
  createdAt: number;
}

export function useRealtimeTasks(uid: string | undefined) {
  const [tasks, setTasks] = useState<RealtimeTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const db = getFirebaseDb();
    const q = query(
      collection(db, "tasks"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc"),
      limit(30)
    );

    const unsub = onSnapshot(q, (snap) => {
      const items: RealtimeTask[] = snap.docs.map((d) => {
        const data = d.data() as any;
        const subtasks: any[] = data.subtasks ?? [];
        const done = subtasks.filter((s: any) => s.done).length;
        return {
          id: d.id,
          title: data.title ?? "Untitled",
          category: data.category ?? data.difficulty ?? "task",
          total: subtasks.length || 1,
          completed: done,
          urgent: data.urgent ?? false,
          difficulty: data.difficulty ?? "medium",
          deadline: data.deadline ?? null,
          createdAt: data.createdAt ?? Date.now(),
        };
      });
      setTasks(items);
      setLoading(false);
    }, (err) => {
      console.error("Realtime tasks error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [uid]);

  return { tasks, loading };
}
