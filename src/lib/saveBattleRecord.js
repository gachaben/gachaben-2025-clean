// src/lib/saveBattleRecord.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth, ensureSignedIn } from "../firebase";

/**
 * バトル結果を保存（旧/新どちらの形でもOK）
 * 呼び出し例:
 *   await saveBattleRecord({ myLeft, enemyLeft, roundsPlayed, winner, userId, selectedItem, enemyItem, endedAt })
 */
export async function saveBattleRecord(payload = {}) {
  await ensureSignedIn();
  const uid = payload?.userId ?? payload?.uid ?? auth.currentUser?.uid ?? null;

  const rawWinner = String(payload?.winner ?? "enemy");
  const winner =
    rawWinner === "me" ? "you" :
    rawWinner === "you" ? "you" :
    rawWinner === "draw" ? "draw" : "enemy";

  const myLeft       = Number(payload?.myLeft ?? payload?.start ?? 0);
  const enemyLeft    = Number(payload?.enemyLeft ?? payload?.end ?? 0);
  const roundsPlayed = Number(payload?.roundsPlayed ?? payload?.rounds ?? 0);

  const docData = {
    // 旧スキーマ互換
    start: myLeft,
    end: enemyLeft,
    roundsPlayed,
    winner, // "you" | "enemy" | "draw"

    // 推奨フィールド
    myLeft,
    enemyLeft,
    uid,
    userId: uid,
    createdAt: serverTimestamp(),

    // 任意
    selectedItem: payload?.selectedItem ?? null,
    enemyItem: payload?.enemyItem ?? null,
    endedAt: payload?.endedAt ?? null,
  };

  const ref = await addDoc(collection(db, "battles"), docData);
  console.log("✅ battles written:", ref.id);
  return ref.id;
}

// デフォルトも出しておく（どちらの import でも使えるように）
export default saveBattleRecord;
