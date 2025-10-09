// src/lib/heartUtils.js
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/** ユーザードキュメントが無ければ初期化（hearts=5, earnedNotes=["ド"] など） */
export async function ensureUserDoc() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;

  const db = getFirestore();
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      name: "テストユーザー",
      hearts: 5,
      login: { earnedNotes: ["ド"] },
      createdAt: new Date(),
    });
  }
  return ref;
}

/** ハート現在値を取得 */
export async function getHearts() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return 0;

  const db = getFirestore();
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data()?.hearts ?? 0) : 0;
}

/** ハートを1消費（0未満にはしない）。消費できたら true を返す */
export async function consumeHeart() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return false;

  const db = getFirestore();
  const ref = await ensureUserDoc();
  const current = await getHearts();
  if (current <= 0) return false;

  await updateDoc(ref, { hearts: current - 1 });
  return true;
}

/** ハートを全回復（=5） */
export async function recoverHearts() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return false;

  const db = getFirestore();
  const ref = doc(db, "users", user.uid);
  await updateDoc(ref, { hearts: 5 });
  return true;
}

/** ハートを任意加算（安全に0〜5へ収める運用は呼び出し側で） */
export async function addHearts(n = 1) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return false;

  const db = getFirestore();
  const ref = doc(db, "users", user.uid);
  await updateDoc(ref, { hearts: increment(n) });
  return true;
}
