import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  increment,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Duel, FriendRequest, Friendship, Guild, Notification } from "@/types";

const db = () => getFirebaseDb();

// ========== FRIENDS ==========

export async function sendFriendRequest(
  fromUid: string,
  fromCallsign: string,
  fromPhoto: string | null,
  toUid: string
): Promise<string> {
  const existing = await getDocs(
    query(
      collection(db(), "friendRequests"),
      where("fromUid", "==", fromUid),
      where("toUid", "==", toUid),
      where("status", "==", "pending")
    )
  );
  if (!existing.empty) return "already_sent";

  const reverse = await getDocs(
    query(
      collection(db(), "friendRequests"),
      where("fromUid", "==", toUid),
      where("toUid", "==", fromUid),
      where("status", "==", "pending")
    )
  );
  if (!reverse.empty) return "already_received";

  const ref = doc(collection(db(), "friendRequests"));
  await setDoc(ref, {
    id: ref.id,
    fromUid,
    fromCallsign,
    fromPhoto,
    toUid,
    status: "pending",
    createdAt: Date.now(),
  });

  await createNotification(toUid, {
    type: "friend_request",
    title: "Friend Request",
    message: `${fromCallsign} wants to be your friend`,
    data: { requestId: ref.id, fromUid },
  });

  return "sent";
}

export async function respondFriendRequest(
  requestId: string,
  accept: boolean
): Promise<void> {
  const reqSnap = await getDoc(doc(db(), "friendRequests", requestId));
  if (!reqSnap.exists()) return;
  const req = reqSnap.data() as FriendRequest;

  await updateDoc(doc(db(), "friendRequests", requestId), {
    status: accept ? "accepted" : "declined",
  });

  if (accept) {
    const friendshipRef = doc(collection(db(), "friendships"));
    await setDoc(friendshipRef, {
      id: friendshipRef.id,
      uid1: req.fromUid,
      uid2: req.toUid,
      createdAt: Date.now(),
    });

    await createNotification(req.fromUid, {
      type: "friend_accepted",
      title: "Friend Request Accepted",
      message: `Your friend request was accepted`,
      data: { friendUid: req.toUid },
    });
  }
}

export async function getFriends(uid: string): Promise<string[]> {
  const snap1 = await getDocs(
    query(collection(db(), "friendships"), where("uid1", "==", uid))
  );
  const snap2 = await getDocs(
    query(collection(db(), "friendships"), where("uid2", "==", uid))
  );
  const friends: string[] = [];
  snap1.forEach((d) => friends.push(d.data().uid2));
  snap2.forEach((d) => friends.push(d.data().uid1));
  return friends;
}

export async function getPendingFriendRequests(
  uid: string
): Promise<FriendRequest[]> {
  const snap = await getDocs(
    query(
      collection(db(), "friendRequests"),
      where("toUid", "==", uid),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    )
  );
  return snap.docs.map((d) => d.data() as FriendRequest);
}

export async function searchUsers(
  searchTerm: string
): Promise<{ uid: string; callsign: string; photoURL: string | null; level: number }[]> {
  if (!searchTerm.trim()) return [];
  const snap = await getDocs(
    query(
      collection(db(), "users"),
      where("callsign", ">=", searchTerm),
      where("callsign", "<=", searchTerm + "\uf8ff"),
      limit(10)
    )
  );
  return snap.docs.map((d) => ({
    uid: d.data().uid,
    callsign: d.data().callsign,
    photoURL: d.data().photoURL,
    level: d.data().level ?? 1,
  }));
}

// ========== DUELS ==========

export async function createDuel(
  challengerId: string,
  challengerName: string,
  opponentId: string,
  opponentName: string,
  durationHours: number = 24
): Promise<string> {
  const ref = doc(collection(db(), "duels"));
  await setDoc(ref, {
    id: ref.id,
    challengerId,
    challengerName,
    challengerXP: 0,
    opponentId,
    opponentName,
    opponentXP: 0,
    status: "pending",
    winnerId: null,
    startTime: null,
    endTime: Date.now() + durationHours * 60 * 60 * 1000,
    createdAt: Date.now(),
  });

  await createNotification(opponentId, {
    type: "duel_request",
    title: "Duel Request",
    message: `${challengerName} challenged you to a duel!`,
    data: { duelId: ref.id },
  });

  return ref.id;
}

export async function acceptDuel(duelId: string): Promise<void> {
  await updateDoc(doc(db(), "duels", duelId), {
    status: "active",
    startTime: Date.now(),
  });
}

export async function updateDuelXP(
  duelId: string,
  userId: string,
  xpGain: number
): Promise<void> {
  const snap = await getDoc(doc(db(), "duels", duelId));
  if (!snap.exists()) return;
  const duel = snap.data() as Duel;

  if (userId === duel.challengerId) {
    await updateDoc(doc(db(), "duels", duelId), {
      challengerXP: increment(xpGain),
    });
  } else {
    await updateDoc(doc(db(), "duels", duelId), {
      opponentXP: increment(xpGain),
    });
  }
}

export async function resolveDuel(duelId: string): Promise<void> {
  const snap = await getDoc(doc(db(), "duels", duelId));
  if (!snap.exists()) return;
  const duel = snap.data() as Duel;

  const winnerId =
    duel.challengerXP > duel.opponentXP
      ? duel.challengerId
      : duel.opponentXP > duel.challengerXP
      ? duel.opponentId
      : null;

  await updateDoc(doc(db(), "duels", duelId), {
    status: "completed",
    winnerId,
  });

  if (winnerId) {
    const loserId =
      winnerId === duel.challengerId ? duel.opponentId : duel.challengerId;
    await createNotification(winnerId, {
      type: "duel_won",
      title: "Victory!",
      message: `You won the duel against ${
        winnerId === duel.challengerId ? duel.opponentName : duel.challengerName
      }!`,
      data: { duelId },
    });
    await createNotification(loserId, {
      type: "duel_lost",
      title: "Defeat",
      message: `You lost the duel`,
      data: { duelId },
    });
  }
}

export async function getUserDuels(uid: string): Promise<Duel[]> {
  const snap1 = await getDocs(
    query(
      collection(db(), "duels"),
      where("challengerId", "==", uid),
      where("status", "in", ["active", "pending"])
    )
  );
  const snap2 = await getDocs(
    query(
      collection(db(), "duels"),
      where("opponentId", "==", uid),
      where("status", "in", ["active", "pending"])
    )
  );
  return [
    ...snap1.docs.map((d) => d.data() as Duel),
    ...snap2.docs.map((d) => d.data() as Duel),
  ];
}

// ========== GUILDS ==========

export async function createGuild(
  ownerId: string,
  name: string,
  description: string
): Promise<string> {
  const ref = doc(collection(db(), "guilds"));
  await setDoc(ref, {
    id: ref.id,
    name,
    description,
    ownerId,
    members: [ownerId],
    memberCount: 1,
    totalXP: 0,
    createdAt: Date.now(),
    icon: name.substring(0, 2).toUpperCase(),
  });

  await updateDoc(doc(db(), "stats", ownerId), { guildId: ref.id });
  return ref.id;
}

export async function joinGuild(
  uid: string,
  guildId: string
): Promise<boolean> {
  const snap = await getDoc(doc(db(), "guilds", guildId));
  if (!snap.exists()) return false;
  const guild = snap.data() as Guild;
  if (guild.members.includes(uid)) return false;

  await updateDoc(doc(db(), "guilds", guildId), {
    members: [...guild.members, uid],
    memberCount: guild.memberCount + 1,
  });
  await updateDoc(doc(db(), "stats", uid), { guildId });
  return true;
}

export async function leaveGuild(uid: string, guildId: string): Promise<void> {
  const snap = await getDoc(doc(db(), "guilds", guildId));
  if (!snap.exists()) return;
  const guild = snap.data() as Guild;
  await updateDoc(doc(db(), "guilds", guildId), {
    members: guild.members.filter((m) => m !== uid),
    memberCount: Math.max(0, guild.memberCount - 1),
  });
  await updateDoc(doc(db(), "stats", uid), { guildId: null });
}

export async function getGuilds(): Promise<Guild[]> {
  const snap = await getDocs(
    query(collection(db(), "guilds"), orderBy("totalXP", "desc"), limit(50))
  );
  return snap.docs.map((d) => d.data() as Guild);
}

export async function getUserGuild(uid: string): Promise<Guild | null> {
  const statsSnap = await getDoc(doc(db(), "stats", uid));
  if (!statsSnap.exists()) return null;
  const guildId = statsSnap.data().guildId;
  if (!guildId) return null;
  const guildSnap = await getDoc(doc(db(), "guilds", guildId));
  return guildSnap.exists() ? (guildSnap.data() as Guild) : null;
}

// ========== LEADERBOARD ==========

export async function getGlobalLeaderboard(
  topN: number = 50
): Promise<
  { uid: string; callsign: string; photoURL: string | null; level: number; totalXP: number }[]
> {
  const snap = await getDocs(
    query(
      collection(db(), "users"),
      orderBy("totalXP", "desc"),
      limit(topN)
    )
  );
  return snap.docs.map((d) => ({
    uid: d.data().uid,
    callsign: d.data().callsign,
    photoURL: d.data().photoURL,
    level: d.data().level ?? 1,
    totalXP: d.data().totalXP ?? 0,
  }));
}

// ========== NOTIFICATIONS ==========

export async function createNotification(
  uid: string,
  data: Omit<Notification, "id" | "uid" | "read" | "createdAt">
): Promise<void> {
  const ref = doc(collection(db(), "notifications"));
  await setDoc(ref, {
    id: ref.id,
    uid,
    ...data,
    read: false,
    createdAt: Date.now(),
  });
}

export async function getNotifications(uid: string): Promise<Notification[]> {
  const snap = await getDocs(
    query(
      collection(db(), "notifications"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc"),
      limit(50)
    )
  );
  return snap.docs.map((d) => d.data() as Notification);
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db(), "notifications", notificationId), { read: true });
}

export async function markAllNotificationsRead(uid: string): Promise<void> {
  const snap = await getDocs(
    query(
      collection(db(), "notifications"),
      where("uid", "==", uid),
      where("read", "==", false)
    )
  );
  const batch = snap.docs.map((d) =>
    updateDoc(d.ref, { read: true })
  );
  await Promise.all(batch);
}
