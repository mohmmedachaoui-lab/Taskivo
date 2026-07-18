import { getFirebaseDb } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export function generateFriendSuffix(): number {
  return Math.floor(1000 + Math.random() * 9000);
}

export function formatFriendCode(callsign: string, suffix: number): string {
  return `${callsign}#${suffix}`;
}

export async function generateUniqueFriendCode(
  callsign: string
): Promise<{ friendCode: string; friendSuffix: number }> {
  const db = getFirebaseDb();
  let attempts = 0;
  while (attempts < 20) {
    const suffix = generateFriendSuffix();
    const friendCode = formatFriendCode(callsign, suffix);
    const existing = await getDocs(
      query(collection(db, "users"), where("friendCode", "==", friendCode))
    );
    if (existing.empty) {
      return { friendCode, friendSuffix: suffix };
    }
    attempts++;
  }
  const fallbackSuffix = Date.now() % 9000 + 1000;
  return {
    friendCode: formatFriendCode(callsign, fallbackSuffix),
    friendSuffix: fallbackSuffix,
  };
}

export async function searchByFriendCode(
  friendCode: string
): Promise<{ uid: string; callsign: string; photoURL: string | null; level: number; totalXP: number } | null> {
  const db = getFirebaseDb();
  const normalized = friendCode.trim().toUpperCase();
  const snap = await getDocs(
    query(collection(db, "users"), where("friendCode", "==", normalized))
  );
  if (snap.empty) return null;
  const d = snap.docs[0].data();
  return {
    uid: d.uid,
    callsign: d.callsign,
    photoURL: d.photoURL,
    level: d.level ?? 1,
    totalXP: d.totalXP ?? 0,
  };
}
