"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Task } from "@/types";

export function useTasks(uid: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
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
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: Task[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            uid: data.uid,
            title: data.title,
            difficulty: data.difficulty,
            completed: data.completed ?? false,
            penalty: data.penalty ?? false,
            deadline: data.deadline ?? null,
            createdAt: data.createdAt ?? Date.now(),
            completedAt: data.completedAt ?? null,
            xpAwarded: data.xpAwarded ?? 0,
          };
        });
        setTasks(items);
        setLoading(false);
      },
      (err) => {
        console.error("Tasks snapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [uid]);

  const addTask = useCallback(
    async (
      title: string,
      difficulty: Task["difficulty"],
      xp: number,
      deadline: number | null
    ) => {
      if (!uid) return;
      const db = getFirebaseDb();
      const ref = doc(collection(db, "tasks"));
      await setDoc(ref, {
        uid,
        title,
        difficulty,
        completed: false,
        penalty: false,
        deadline,
        createdAt: Date.now(),
        completedAt: null,
        xpAwarded: xp,
      });
    },
    [uid]
  );

  const toggleTask = useCallback(
    async (id: string) => {
      if (!uid) return;
      const db = getFirebaseDb();
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const newCompleted = !task.completed;
      await updateDoc(doc(db, "tasks", id), {
        completed: newCompleted,
        completedAt: newCompleted ? Date.now() : null,
      });
    },
    [uid, tasks]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      if (!uid) return;
      const db = getFirebaseDb();
      await deleteDoc(doc(db, "tasks", id));
    },
    [uid]
  );

  return { tasks, loading, addTask, toggleTask, deleteTask };
}
