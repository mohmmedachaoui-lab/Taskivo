import { searchPublicProfiles } from "@/lib/profiles";

export function generateFriendSuffix(): number {
  return Math.floor(1000 + Math.random() * 9000);
}

export function formatFriendCode(callsign: string, suffix: number): string {
  return `${callsign}#${suffix}`;
}

export async function generateUniqueFriendCode(
  callsign: string
): Promise<{ friendCode: string; friendSuffix: number }> {
  let attempts = 0;
  while (attempts < 20) {
    const suffix = generateFriendSuffix();
    const friendCode = formatFriendCode(callsign, suffix);
    const existing = await searchPublicProfiles(friendCode);
    if (existing.length === 0) {
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
  const results = await searchPublicProfiles(friendCode);
  if (results.length === 0) return null;
  const p = results[0];
  return {
    uid: p.uid,
    callsign: p.callsign,
    photoURL: p.photoURL,
    level: p.level,
    totalXP: p.totalXP,
  };
}
