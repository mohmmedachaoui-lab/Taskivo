"use client";

import { useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { WeeklyGoal, WeeklyGoalTask } from "@/types";

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function getWeekBounds(date: Date): { weekStart: number; weekEnd: number } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { weekStart: start.getTime(), weekEnd: end.getTime() };
}

export function useWeeklyGoals(uid: string | undefined) {
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const subscribeToGoals = useCallback(
    (callback: (goals: WeeklyGoal[]) => void) => {
      if (!uid) return () => {};
      const db = getFirebaseDb();
      const q = query(
        collection(db, "weeklyGoals"),
        where("uid", "==", uid),
        orderBy("weekStart", "desc")
      );
      return onSnapshot(q, (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as WeeklyGoal[];
        callback(items);
        setLoading(false);
      });
    },
    [uid]
  );

  const createWeeklyGoal = useCallback(
    async (title: string): Promise<string | null> => {
      if (!uid) return null;
      const db = getFirebaseDb();
      const { weekStart, weekEnd } = getWeekBounds(new Date());
      const goalData = {
        uid,
        title,
        weekStart,
        weekEnd,
        tasks: [] as WeeklyGoalTask[],
        completed: false,
        createdAt: Date.now(),
      };
      const ref = await addDoc(collection(db, "weeklyGoals"), goalData);
      return ref.id;
    },
    [uid]
  );

  const addGoalTask = useCallback(
    async (goalId: string, title: string, targetCount: number): Promise<void> => {
      const db = getFirebaseDb();
      const goalRef = doc(db, "weeklyGoals", goalId);
      const task: WeeklyGoalTask = {
        id: generateId(),
        title,
        targetCount,
        currentCount: 0,
        completed: false,
      };
      const goalSnap = await getDocs(
        query(collection(db, "weeklyGoals"), where("__name__", "==", goalId))
      );
      if (goalSnap.empty) return;
      const existing = goalSnap.docs[0].data() as WeeklyGoal;
      await updateDoc(goalRef, {
        tasks: [...(existing.tasks || []), task],
      });
    },
    []
  );

  const toggleGoalTask = useCallback(
    async (goalId: string, taskId: string): Promise<void> => {
      const db = getFirebaseDb();
      const goalRef = doc(db, "weeklyGoals", goalId);
      const goalSnap = await getDocs(
        query(collection(db, "weeklyGoals"), where("__name__", "==", goalId))
      );
      if (goalSnap.empty) return;
      const existing = goalSnap.docs[0].data() as WeeklyGoal;
      const updatedTasks = existing.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const newCount = Math.min(t.currentCount + 1, t.targetCount);
        return {
          ...t,
          currentCount: newCount,
          completed: newCount >= t.targetCount,
        };
      });
      const allDone = updatedTasks.length > 0 && updatedTasks.every((t) => t.completed);
      await updateDoc(goalRef, {
        tasks: updatedTasks,
        completed: allDone,
      });
    },
    []
  );

  const deleteGoal = useCallback(async (goalId: string): Promise<void> => {
    const db = getFirebaseDb();
    await deleteDoc(doc(db, "weeklyGoals", goalId));
  }, []);

  const resetWeeklyGoal = useCallback(
    async (goalId: string): Promise<string | null> => {
      if (!uid) return null;
      const db = getFirebaseDb();
      const goalSnap = await getDocs(
        query(collection(db, "weeklyGoals"), where("__name__", "==", goalId))
      );
      if (goalSnap.empty) return null;
      const existing = goalSnap.docs[0].data() as WeeklyGoal;
      const { weekStart, weekEnd } = getWeekBounds(new Date());
      const resetTasks = existing.tasks.map((t) => ({
        ...t,
        currentCount: 0,
        completed: false,
      }));
      const ref = await addDoc(collection(db, "weeklyGoals"), {
        uid,
        title: existing.title,
        weekStart,
        weekEnd,
        tasks: resetTasks,
        completed: false,
        createdAt: Date.now(),
      });
      return ref.id;
    },
    [uid]
  );

  return {
    goals,
    setGoals,
    loading,
    subscribeToGoals,
    createWeeklyGoal,
    addGoalTask,
    toggleGoalTask,
    deleteGoal,
    resetWeeklyGoal,
  };
}
