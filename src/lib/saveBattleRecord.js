// src/lib/saveBattleRecord.js
import { db } from "../firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  waitForPendingWrites,
} from "firebase/firestore";

/** 入力チェック & 正規化 */
function buildBattlePayload(raw) {
  if (!raw) throw new Error("payload is required");

  const { uid = "anon", me, enemy, roundsPlayed, questionCount, winner } = raw;

  if (!me || !enemy) throw new Error("me/enemy required");
  const num = (v) => Number.isFinite(v);
  if (![me.start, me.end, enemy.start, enemy.end].every(num)) {
    throw new Error("start/end must be number");
  }
  if (![roundsPlayed, questionCount].every(num)) {
    throw new Error("roundsPlayed/questionCount must be number");
  }
  if (!["me", "enemy", "draw"].includes(winner)) {
    throw new Error("winner invalid");
  }

  return {
    uid,
    me: { name: me.name ?? "", start: me.start, end: me.end },
    enemy: { name: enemy.name ?? "", start: enemy.start, end: enemy.end },
    roundsPlayed,
    questionCount,
    winner,
  };
}

/** battles に記録（サーバ反映まで待つ） */
export async function saveBattleRecord(rawPayload) {
  const payload = buildBattlePayload(rawPayload);

  const ref = await addDoc(collection(db, "battles"), {
    ...payload,
    createdAt: serverTimestamp(),
  });

  // エミュ/本番どちらでも確実にサーバ反映されるまで待機
  await waitForPendingWrites(db);

  console.log("✅ battles written docId:", ref.id);
  return ref.id;
}
