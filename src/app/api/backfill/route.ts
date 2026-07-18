import { NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminDb() {
  if (getApps().length === 0) {
    const config = JSON.parse(process.env.FIREBASE_CONFIG ?? "{}");
    initializeApp({ credential: cert(config) });
  }
  return getFirestore();
}

function generateFriendSuffix(): number {
  return Math.floor(1000 + Math.random() * 9000);
}

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const db = getAdminDb();
    const usersSnap = await db.collection("users").get();

    let friendCodesGenerated = 0;
    let publicProfilesCreated = 0;
    let alreadyHadCode = 0;

    const batch = db.batch();

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      const data = userDoc.data();

      let friendCode = data.friendCode as string | undefined;
      let friendSuffix = data.friendSuffix as number | undefined;

      if (!friendCode) {
        const callsign = (data.callsign as string) || "Agent";
        friendSuffix = generateFriendSuffix();
        friendCode = `${callsign}#${friendSuffix}`;
        friendCodesGenerated++;

        const userRef = db.collection("users").doc(uid);
        batch.update(userRef, { friendCode, friendSuffix });
      } else {
        alreadyHadCode++;
      }

      const ppRef = db.collection("publicProfiles").doc(uid);
      batch.set(ppRef, {
        uid,
        callsign: data.callsign ?? "",
        photoURL: data.photoURL ?? null,
        friendCode,
        friendSuffix: friendSuffix ?? 0,
        rank: data.rank ?? "Novice",
        level: data.level ?? 1,
        totalXP: data.totalXP ?? 0,
      });
      publicProfilesCreated++;
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      totalUsers: usersSnap.size,
      friendCodesGenerated,
      alreadyHadCode,
      publicProfilesCreated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
