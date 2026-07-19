import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { getPublicProfile } from "@/lib/profiles";
import { Conversation } from "@/types";

const db = () => getFirebaseDb();

// ========== CONVERSATION HELPERS ==========

function getDirectConversationId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join("_");
}

// ========== GET OR CREATE DIRECT CONVERSATION ==========

export async function getOrCreateDirectConversation(
  fromUid: string,
  fromCallsign: string,
  toUid: string,
  toCallsign: string
): Promise<string> {
  const conversationId = getDirectConversationId(fromUid, toUid);
  const ref = doc(db(), "conversations", conversationId);
  const snap = await getDoc(ref);

  if (snap.exists()) return conversationId;

  const members = [fromUid, toUid].sort();
  await setDoc(ref, {
    id: conversationId,
    type: "direct",
    members,
    memberCallsigns: {
      [fromUid]: fromCallsign,
      [toUid]: toCallsign,
    },
    lastMessage: "",
    lastMessageAt: Date.now(),
    lastMessageUid: "",
    createdBy: fromUid,
    createdAt: Date.now(),
  });

  return conversationId;
}

// ========== SEND MESSAGE ==========

export async function sendMessage(
  conversationId: string,
  senderUid: string,
  senderCallsign: string,
  text: string
): Promise<string> {
  const msgRef = doc(collection(db(), "conversations", conversationId, "messages"));
  const msgData = {
    id: msgRef.id,
    senderUid,
    senderCallsign,
    text: text.trim(),
    timestamp: Date.now(),
    read: false,
  };
  await setDoc(msgRef, msgData);

  await updateDoc(doc(db(), "conversations", conversationId), {
    lastMessage: text.trim().slice(0, 100),
    lastMessageAt: Date.now(),
    lastMessageUid: senderUid,
  });

  return msgRef.id;
}

// ========== MARK MESSAGES READ ==========

export async function markMessagesRead(
  conversationId: string,
  readerUid: string
): Promise<void> {
  const snap = await getDocs(
    query(
      collection(db(), "conversations", conversationId, "messages"),
      where("read", "==", false)
    )
  );
  const batch = snap.docs
    .filter((d) => d.data().senderUid !== readerUid)
    .map((d) => updateDoc(d.ref, { read: true }));
  await Promise.all(batch);
}

// ========== GET CONVERSATIONS ==========

export async function getUserConversations(
  uid: string
): Promise<Conversation[]> {
  const snap = await getDocs(
    query(
      collection(db(), "conversations"),
      where("members", "array-contains", uid)
    )
  );
  return snap.docs
    .map((d) => d.data() as Conversation)
    .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
}

// ========== GET UNREAD COUNT ==========

export async function getUnreadMessageCount(
  uid: string
): Promise<number> {
  const conversations = await getUserConversations(uid);
  if (conversations.length === 0) return 0;

  const counts = await Promise.all(
    conversations.map(async (conv) => {
      const snap = await getDocs(
        query(
          collection(db(), "conversations", conv.id, "messages"),
          where("read", "==", false),
          where("senderUid", "!=", uid)
        )
      );
      return snap.size;
    })
  );
  return counts.reduce((a, b) => a + b, 0);
}

// ========== GROUP CHAT ==========

export async function createGroupConversation(
  creatorUid: string,
  creatorCallsign: string,
  memberUids: string[],
  memberCallsigns: Record<string, string>,
  groupName: string,
  groupIcon: string = "GT"
): Promise<string> {
  const allMembers = [...new Set([creatorUid, ...memberUids])];
  const ref = doc(collection(db(), "conversations"));
  await setDoc(ref, {
    id: ref.id,
    type: "group",
    members: allMembers,
    memberCallsigns,
    lastMessage: "",
    lastMessageAt: Date.now(),
    lastMessageUid: "",
    createdBy: creatorUid,
    groupName,
    groupIcon: groupIcon.slice(0, 2).toUpperCase(),
    createdAt: Date.now(),
  });
  return ref.id;
}

export async function addGroupMember(
  conversationId: string,
  newUid: string,
  newCallsign: string
): Promise<void> {
  const ref = doc(db(), "conversations", conversationId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const conv = snap.data() as Conversation;
  if (conv.members.includes(newUid)) return;

  await updateDoc(ref, {
    members: [...conv.members, newUid],
    memberCallsigns: { ...conv.memberCallsigns, [newUid]: newCallsign },
  });
}

export async function removeGroupMember(
  conversationId: string,
  targetUid: string
): Promise<void> {
  const ref = doc(db(), "conversations", conversationId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const conv = snap.data() as Conversation;

  const newCallsigns = { ...conv.memberCallsigns };
  delete newCallsigns[targetUid];

  await updateDoc(ref, {
    members: conv.members.filter((m) => m !== targetUid),
    memberCallsigns: newCallsigns,
  });
}

export async function renameGroup(
  conversationId: string,
  newName: string
): Promise<void> {
  await updateDoc(doc(db(), "conversations", conversationId), {
    groupName: newName,
  });
}

// ========== TYPING INDICATOR ==========

export async function setTyping(
  conversationId: string,
  uid: string,
  isTyping: boolean
): Promise<void> {
  const ref = doc(db(), "conversations", conversationId, "typing", uid);
  await setDoc(ref, {
    isTyping,
    updatedAt: Date.now(),
  });
}

// ========== GET USER PROFILE FOR FRIEND CARD ==========

export async function getUserProfile(
  uid: string
): Promise<{
  uid: string;
  callsign: string;
  friendCode: string;
  photoURL: string | null;
  level: number;
  totalXP: number;
} | null> {
  const profile = await getPublicProfile(uid);
  if (!profile) return null;
  return {
    uid: profile.uid,
    callsign: profile.callsign,
    friendCode: profile.friendCode,
    photoURL: profile.photoURL,
    level: profile.level,
    totalXP: profile.totalXP,
  };
}

export async function getUserStatsForProfile(
  uid: string
): Promise<{
  tasksCompleted: number;
  duelsWon: number;
  currentStreak: number;
  achievements: string[];
} | null> {
  const snap = await getDoc(doc(db(), "stats", uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    tasksCompleted: d.tasksCompleted ?? 0,
    duelsWon: d.duelsWon ?? 0,
    currentStreak: d.currentStreak ?? 0,
    achievements: d.achievements ?? [],
  };
}
