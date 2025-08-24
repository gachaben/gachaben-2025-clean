// src/fbkit/index.ts
// 互換ハブ: 既存コードは "@/firebase" だけ見ればOK

// ---- appレイヤ（getterの公開） ----
export {
  getFirebaseApp,
  getFirestoreDb,
  getFirebaseAuth,
  getFirebaseStorage,
} from "./app";

// ---- 即値（旧コード互換: db/auth/storage をそのまま使いたい箇所向け）----
import { getFirestoreDb, getFirebaseAuth, getFirebaseStorage } from "./app";
export const db = getFirestoreDb();
export const auth = getFirebaseAuth();
export const storage = getFirebaseStorage();

// ---- Firestore: 必要なものだけ再エクスポート（重複回避）----
export {
  // add / set / get / update / delete
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,

  // refs
  doc,
  collection,
  collectionGroup,

  // queries
  query,
  where,
  orderBy,
  limit,
  startAfter,
  startAt,
  endAt,
  endBefore,

  // realtime & utils
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
  getCountFromServer,
} from "firebase/firestore";

// ---- Auth: 必要な分だけ再エクスポート ----
export {
  onAuthStateChanged,
  signInAnonymously,
  updateProfile,
  signOut,
} from "firebase/auth";

// ※ ensureSignedIn で使うために明示importしておく（再エクスポートとは別）
import { signInAnonymously as _signInAnonymously } from "firebase/auth";

// ---- ensureSignedIn（共通のAuthインスタンスで匿名ログインを保証）----
export async function ensureSignedIn() {
  const a = getFirebaseAuth(); // fbkitのAuth（エミュ接続済み）
  if (!a.currentUser) {
    try {
      await _signInAnonymously(a);
    } catch (e) {
      console.error("anonymous sign-in failed", e);
    }
  }
  return a.currentUser;
}

// ---- default 互換（legacy で default を期待している箇所向け）----
const compat = { db, auth, storage };
export default compat;
