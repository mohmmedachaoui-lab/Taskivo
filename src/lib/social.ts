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
  increment,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import {
  getPublicProfiles,
  searchPublicProfiles,
  getLeaderboard,
  applyXPTransaction,
} from "@/lib/profiles";
import {
  Duel,
  FriendRequest,
  Guild,
  GuildNews,
  Notification,
  ActivityFeedItem,
} from "@/types";

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

  const alreadyFriends1 = await getDocs(
    query(
      collection(db(), "friendships"),
      where("uid1", "==", fromUid),
      where("uid2", "==", toUid)
    )
  );
  if (!alreadyFriends1.empty) return "already_friends";

  const alreadyFriends2 = await getDocs(
    query(
      collection(db(), "friendships"),
      where("uid1", "==", toUid),
      where("uid2", "==", fromUid)
    )
  );
  if (!alreadyFriends2.empty) return "already_friends";

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
      requestId: requestId,
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

// ========== REMOVE FRIEND ==========

export async function removeFriend(
  currentUid: string,
  friendUid: string
): Promise<"removed" | "not_friends"> {
  const snap1 = await getDocs(
    query(
      collection(db(), "friendships"),
      where("uid1", "==", currentUid),
      where("uid2", "==", friendUid)
    )
  );
  if (!snap1.empty) {
    await deleteDoc(snap1.docs[0].ref);
    return "removed";
  }

  const snap2 = await getDocs(
    query(
      collection(db(), "friendships"),
      where("uid1", "==", friendUid),
      where("uid2", "==", currentUid)
    )
  );
  if (!snap2.empty) {
    await deleteDoc(snap2.docs[0].ref);
    return "removed";
  }

  return "not_friends";
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
): Promise<{ uid: string; callsign: string; photoURL: string | null; level: number; totalXP: number }[]> {
  const profiles = await searchPublicProfiles(searchTerm);
  return profiles.map((p) => ({
    uid: p.uid,
    callsign: p.callsign,
    photoURL: p.photoURL,
    level: p.level,
    totalXP: p.totalXP,
  }));
}

// ========== DUELS ==========

export async function createDuel(
  challengerId: string,
  challengerName: string,
  opponentId: string,
  opponentName: string,
  stakeXP: number = 100,
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
    stakeXP,
    challengerSettled: false,
    opponentSettled: false,
  });

  await createNotification(opponentId, {
    type: "duel_request",
    title: "Duel Challenge",
    message: `${challengerName} challenged you! Stake: ${stakeXP} XP`,
    data: { duelId: ref.id, stakeXP },
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

  if (duel.status === "completed") return;

  const winnerId =
    duel.challengerXP > duel.opponentXP
      ? duel.challengerId
      : duel.opponentXP > duel.challengerXP
      ? duel.opponentId
      : null;

  // Step 1: Mark duel complete (either participant can write this)
  await updateDoc(doc(db(), "duels", duelId), {
    status: "completed",
    winnerId,
  });
}

export async function settleDuelSide(duelId: string, uid: string): Promise<void> {
  const snap = await getDoc(doc(db(), "duels", duelId));
  if (!snap.exists()) return;
  const duel = snap.data() as Duel;

  if (duel.status !== "completed") return;

  const isChallenger = uid === duel.challengerId;
  if (isChallenger && duel.challengerSettled) return;
  if (!isChallenger && duel.opponentSettled) return;

  const stake = duel.stakeXP || 100;
  const isWinner = duel.winnerId === uid;
  const isDraw = duel.winnerId === null;

  let xpChange: number;
  let extraStats: Record<string, unknown>;

  if (isDraw) {
    xpChange = 0;
    extraStats = {};
  } else if (isWinner) {
    xpChange = stake;
    extraStats = { duelsWon: increment(1) };
  } else {
    const loserSnap = await getDoc(doc(db(), "users", uid));
    const currentXP = loserSnap.data()?.totalXP ?? 0;
    const cappedPenalty = Math.min(stake, currentXP);
    xpChange = -cappedPenalty;
    extraStats = { xpLost: increment(cappedPenalty) };
  }

  if (xpChange !== 0) {
    await applyXPTransaction(uid, xpChange, extraStats);
  } else if (Object.keys(extraStats).length > 0) {
    await applyXPTransaction(uid, 0, extraStats);
  }

  // Mark this user's side as settled
  const settlementField = isChallenger ? "challengerSettled" : "opponentSettled";
  await updateDoc(doc(db(), "duels", duelId), {
    [settlementField]: true,
  });
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

export async function getCompletedDuels(uid: string): Promise<Duel[]> {
  const snap1 = await getDocs(
    query(
      collection(db(), "duels"),
      where("challengerId", "==", uid),
      where("status", "==", "completed"),
      orderBy("createdAt", "desc"),
      limit(20)
    )
  );
  const snap2 = await getDocs(
    query(
      collection(db(), "duels"),
      where("opponentId", "==", uid),
      where("status", "==", "completed"),
      orderBy("createdAt", "desc"),
      limit(20)
    )
  );
  const all = [
    ...snap1.docs.map((d) => d.data() as Duel),
    ...snap2.docs.map((d) => d.data() as Duel),
  ];
  const unique = new Map(all.map((d) => [d.id, d]));
  return Array.from(unique.values()).sort((a, b) => b.createdAt - a.createdAt);
}

// ========== GUILDS ==========

export async function createGuild(
  ownerId: string,
  name: string,
  description: string,
  ownerCallsign: string = "Owner"
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

  const newsRef = doc(collection(db(), "guildNews"));
  await setDoc(newsRef, {
    id: newsRef.id,
    guildId: ref.id,
    message: `${ownerCallsign} created the guild`,
    type: "milestone",
    createdAt: Date.now(),
  });

  return ref.id;
}

export async function joinGuild(
  uid: string,
  guildId: string,
  callsign: string = "New Member"
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

  const newsRef = doc(collection(db(), "guildNews"));
  await setDoc(newsRef, {
    id: newsRef.id,
    guildId,
    message: `${callsign} joined the guild`,
    type: "join",
    createdAt: Date.now(),
  });

  return true;
}

export async function leaveGuild(uid: string, guildId: string, callsign: string = "Member"): Promise<void> {
  const snap = await getDoc(doc(db(), "guilds", guildId));
  if (!snap.exists()) return;
  const guild = snap.data() as Guild;
  await updateDoc(doc(db(), "guilds", guildId), {
    members: guild.members.filter((m) => m !== uid),
    memberCount: Math.max(0, guild.memberCount - 1),
  });
  await updateDoc(doc(db(), "stats", uid), { guildId: null });

  const newsRef = doc(collection(db(), "guildNews"));
  await setDoc(newsRef, {
    id: newsRef.id,
    guildId,
    message: `${callsign} left the guild`,
    type: "leave",
    createdAt: Date.now(),
  });
}

export async function kickMember(
  ownerId: string,
  guildId: string,
  targetUid: string,
  targetCallsign: string
): Promise<boolean> {
  const snap = await getDoc(doc(db(), "guilds", guildId));
  if (!snap.exists()) return false;
  const guild = snap.data() as Guild;
  if (guild.ownerId !== ownerId) return false;

  await updateDoc(doc(db(), "guilds", guildId), {
    members: guild.members.filter((m) => m !== targetUid),
    memberCount: Math.max(0, guild.memberCount - 1),
  });
  await updateDoc(doc(db(), "stats", targetUid), { guildId: null });

  const newsRef = doc(collection(db(), "guildNews"));
  await setDoc(newsRef, {
    id: newsRef.id,
    guildId,
    message: `${targetCallsign} was kicked from the guild`,
    type: "kick",
    createdAt: Date.now(),
  });

  await createNotification(targetUid, {
    type: "guild_invite",
    title: "Removed from Guild",
    message: `You have been removed from the guild`,
    data: { guildId },
  });

  return true;
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

export async function getGuildMembers(memberUids: string[]): Promise<{ uid: string; callsign: string; totalXP: number; level: number }[]> {
  if (memberUids.length === 0) return [];
  const profiles = await getPublicProfiles(memberUids);
  return profiles.map((p) => ({
    uid: p.uid,
    callsign: p.callsign,
    totalXP: p.totalXP,
    level: p.level,
  }));
}

export async function getGuildNews(guildId: string): Promise<GuildNews[]> {
  const snap = await getDocs(
    query(
      collection(db(), "guildNews"),
      where("guildId", "==", guildId),
      orderBy("createdAt", "desc"),
      limit(20)
    )
  );
  return snap.docs.map((d) => d.data() as GuildNews);
}

export async function updateGuildXP(guildId: string, xpGain: number): Promise<void> {
  await updateDoc(doc(db(), "guilds", guildId), {
    totalXP: increment(xpGain),
  });
}

// ========== ACTIVITY FEED ==========

export async function addActivityFeedItem(
  uid: string,
  callsign: string,
  type: ActivityFeedItem["type"],
  message: string,
  xpChange: number
): Promise<void> {
  const ref = doc(collection(db(), "activityFeed"));
  await setDoc(ref, {
    id: ref.id,
    uid,
    callsign,
    type,
    message,
    xpChange,
    createdAt: Date.now(),
  });
}

export async function getActivityFeed(
  friendUids: string[],
  currentUid: string
): Promise<ActivityFeedItem[]> {
  const allUids = [currentUid, ...friendUids];
  if (allUids.length === 0) return [];

  const results: ActivityFeedItem[] = [];
  const batchSize = 10;
  for (let i = 0; i < allUids.length; i += batchSize) {
    const batch = allUids.slice(i, i + batchSize);
    const snap = await getDocs(
      query(
        collection(db(), "activityFeed"),
        where("uid", "in", batch),
        orderBy("createdAt", "desc"),
        limit(30)
      )
    );
    snap.forEach((d) => results.push(d.data() as ActivityFeedItem));
  }
  return results.sort((a, b) => b.createdAt - a.createdAt).slice(0, 30);
}

// ========== LEADERBOARD ==========

export async function getGlobalLeaderboard(
  topN: number = 50
): Promise<
  { uid: string; callsign: string; photoURL: string | null; level: number; totalXP: number }[]
> {
  const profiles = await getLeaderboard(topN);
  return profiles.map((p) => ({
    uid: p.uid,
    callsign: p.callsign,
    photoURL: p.photoURL,
    level: p.level,
    totalXP: p.totalXP,
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
