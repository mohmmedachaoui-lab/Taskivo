"use client";

import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "taskivo-offline-queue";
const DB_VERSION = 1;
const STORE_NAME = "actions";

export interface QueuedAction {
  id?: number;
  type: string;
  payload: unknown;
  createdAt: number;
  retries: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("createdAt", "createdAt");
        }
      },
    });
  }
  return dbPromise;
}

export async function queueAction(type: string, payload: unknown): Promise<number> {
  const db = await getDB();
  const id = await db.add(STORE_NAME, {
    type,
    payload,
    createdAt: Date.now(),
    retries: 0,
  } as QueuedAction);
  return id as number;
}

export async function getQueuedActions(): Promise<QueuedAction[]> {
  const db = await getDB();
  return db.getAllFromIndex(STORE_NAME, "createdAt");
}

export async function removeAction(id: number): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function clearQueue(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_NAME);
}

type ActionHandler = (type: string, payload: unknown) => Promise<void>;

let processHandler: ActionHandler | null = null;
let processing = false;

export function registerActionHandler(handler: ActionHandler) {
  processHandler = handler;
}

export async function processQueue(): Promise<number> {
  if (processing || !processHandler) return 0;
  processing = true;

  let processed = 0;
  try {
    const actions = await getQueuedActions();
    for (const action of actions) {
      try {
        await processHandler(action.type, action.payload);
        await removeAction(action.id!);
        processed++;
      } catch {
        const db = await getDB();
        const updated = { ...action, retries: action.retries + 1 };
        if (updated.retries >= 5) {
          await removeAction(action.id!);
        } else {
          await db.put(STORE_NAME, updated);
        }
      }
    }
  } finally {
    processing = false;
  }
  return processed;
}

export function initOfflineSync() {
  if (typeof window === "undefined") return;

  window.addEventListener("online", () => {
    setTimeout(() => processQueue(), 1000);
  });
}
