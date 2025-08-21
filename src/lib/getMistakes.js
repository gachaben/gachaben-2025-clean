// @KEEP 理由: 柱（❤/ガチャ/ミッション/ランキング/問題履歴）に一致
// src/lib/getMistakes.js
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "../legacy_deprecated/firebase";

/**
 * ログイン中ユーザーの間違い履歴を取得
 * まず userId で検索（旧互換）、0件なら uid でも検索するフォールバック
 */
export async function getMistakes(userId) {
  if (!userId) throw new Error("getMistakes: userId is required");

  // 1) 旧互換: userId で取得
  const q1 = query(
    collection(db, "mistakes"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap1 = await getDocs(q1);
  if (!snap1.empty) {
    return snap1.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  // 2) フォールバック: uid で取得
  const q2 = query(
    collection(db, "mistakes"),
    where("uid", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap2 = await getDocs(q2);
  return snap2.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
