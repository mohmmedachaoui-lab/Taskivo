import { getFirebaseDb } from "@/lib/firebase";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  limit,
  increment,
  runTransaction,
} from "firebase/firestore";
import { calculateLevel } from "@/lib/xp-engine";

const db = () => getFirebaseDb();

export interface PublicProfile {
  uid: string;
  callsign: string;
  photoURL: string | null;
  friendCode: string;
  friendSuffix: number;
  rank: string;
  level: number;
  totalXP: number;
}

const PUBLIC_FIELDS: (keyof PublicProfile)[] = [
  "uid", "callsign", "photoURL", "friendCode", "friendSuffix", "rank", "level", "totalXP",
];

function pickPublic<T extends Record<string, unknown>>(data: T): PublicProfile {
  return {
    uid: String(data.uid ?? ""),
    callsign: String(data.callsign ?? ""),
    photoURL: (data.photoURL as string | null) ?? null,
    friendCode: String(data.friendCode ?? ""),
    friendSuffix: Number(data.friendSuffix ?? 0),
    rank: String(data.rank ?? "Novice"),
    level: Number(data.level ?? 1),
    totalXP: Number(data.totalXP ?? 0),
  };
}

export async function createPublicProfile(uid: string, data: Record<string, unknown>): Promise<void> {
  await setDoc(doc(db(), "publicProfiles", uid), pickPublic(data));
}

export async function updatePublicProfile(uid: string, fields: Partial<PublicProfile>): Promise<void> {
  const ref = doc(db(), "publicProfiles", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, fields);
  } else {
    await setDoc(ref, { uid, ...fields } as PublicProfile);
  }
}

export async function incrementPublicXP(uid: string, amount: number): Promise<void> {
  const dbInstance = getFirebaseDb();
  await runTransaction(dbInstance, async (transaction) => {
    const ref = doc(dbInstance, "publicProfiles", uid);
    const snap = await transaction.get(ref);
    if (!snap.exists()) return;

    const currentXP = snap.data()?.totalXP ?? 0;
    const newTotalXP = Math.max(0, currentXP + amount);
    const newLevel = calculateLevel(newTotalXP);
    const xpChange = newTotalXP - currentXP;

    transaction.update(ref, {
      totalXP: increment(xpChange),
      level: newLevel,
    });
  });
}

export async function getPublicProfile(uid: string): Promise<PublicProfile | null> {
  const snap = await getDoc(doc(db(), "publicProfiles", uid));
  if (!snap.exists()) return null;
  return snap.data() as PublicProfile;
}

export async function getPublicProfiles(uids: string[]): Promise<PublicProfile[]> {
  if (uids.length === 0) return [];
  const results: PublicProfile[] = [];
  const batchSize = 10;
  for (let i = 0; i < uids.length; i += batchSize) {
    const batch = uids.slice(i, i + batchSize);
    const snap = await getDocs(
      query(collection(db(), "publicProfiles"), where("uid", "in", batch))
    );
    snap.forEach((d) => results.push(d.data() as PublicProfile));
  }
  return results;
}

export async function searchPublicProfiles(
  searchTerm: string
): Promise<PublicProfile[]> {
  if (!searchTerm.trim()) return [];
  const term = searchTerm.trim();

  if (term.includes("#")) {
    const snap = await getDocs(
      query(
        collection(db(), "publicProfiles"),
        where("friendCode", "==", term.toUpperCase()),
        limit(5)
      )
    );
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as PublicProfile);
    }
  }

  const snap = await getDocs(
    query(
      collection(db(), "publicProfiles"),
      where("callsign", ">=", term),
      where("callsign", "<=", term + "\uf8ff"),
      limit(10)
    )
  );
  return snap.docs.map((d) => d.data() as PublicProfile);
}

export async function getLeaderboard(topN: number = 50): Promise<PublicProfile[]> {
  const snap = await getDocs(
    query(
      collection(db(), "publicProfiles"),
      where("totalXP", ">=", 0),
      limit(topN)
    )
  );
  return snap.docs
    .map((d) => d.data() as PublicProfile)
    .sort((a, b) => b.totalXP - a.totalXP);
}

export async function applyXPTransaction(
  uid: string,
  xpChange: number,
  extraStats: Record<string, unknown> = {}
): Promise<{ newTotalXP: number; newLevel: number }> {
  const dbInstance = getFirebaseDb();
  return runTransaction(dbInstance, async (transaction) => {
    const userRef = doc(dbInstance, "users", uid);
    const statsRef = doc(dbInstance, "stats", uid);
    const ppRef = doc(dbInstance, "publicProfiles", uid);

    const [userSnap, statsSnap, ppSnap] = await Promise.all([
      transaction.get(userRef),
      transaction.get(statsRef),
      transaction.get(ppRef),
    ]);

    const currentXP = userSnap.data()?.totalXP ?? 0;
    const newTotalXP = Math.max(0, currentXP + xpChange);
    const newLevel = calculateLevel(newTotalXP);
    const xpChangeCapped = newTotalXP - currentXP;

    transaction.update(userRef, { totalXP: increment(xpChangeCapped) });
    const { totalXP: _ignored, ...restStats } = extraStats;
    transaction.update(statsRef, { totalXP: increment(xpChangeCapped), ...restStats });

    if (ppSnap.exists()) {
      transaction.update(ppRef, {
        totalXP: increment(xpChangeCapped),
        level: newLevel,
      });
    }

    return { newTotalXP, newLevel };
  });
}

export async function completeTaskAtomically(
  uid: string,
  taskId: string,
  xpAwarded: number,
  extraStats: Record<string, unknown> = {}
): Promise<{ newTotalXP: number; newLevel: number } | null> {
  const dbInstance = getFirebaseDb();
  return runTransaction(dbInstance, async (transaction) => {
    const taskRef = doc(dbInstance, "tasks", taskId);
    const userRef = doc(dbInstance, "users", uid);
    const statsRef = doc(dbInstance, "stats", uid);
    const ppRef = doc(dbInstance, "publicProfiles", uid);

    const [taskSnap, userSnap, ppSnap] = await Promise.all([
      transaction.get(taskRef),
      transaction.get(userRef),
      transaction.get(ppRef),
    ]);

    if (!taskSnap.exists() || taskSnap.data().completed) return null;

    const currentXP = userSnap.data()?.totalXP ?? 0;
    const newTotalXP = Math.max(0, currentXP + xpAwarded);
    const newLevel = calculateLevel(newTotalXP);
    const xpChangeCapped = newTotalXP - currentXP;

    transaction.update(taskRef, { completed: true, completedAt: Date.now() });
    transaction.update(userRef, { totalXP: increment(xpChangeCapped) });
    const { totalXP: _ignored, ...restStats } = extraStats;
    transaction.update(statsRef, { totalXP: increment(xpChangeCapped), ...restStats });

    if (ppSnap.exists()) {
      transaction.update(ppRef, {
        totalXP: increment(xpChangeCapped),
        level: newLevel,
      });
    }

    return { newTotalXP, newLevel };
  });
}
