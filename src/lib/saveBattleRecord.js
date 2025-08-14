// src/lib/saveBattleRecord.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/**
 * バトル結果を保存
 * @param {{start:number,end:number,roundsPlayed:number,winner:"you"|"enemy", userId?:string}} payload
 * @returns {Promise<string>} battleId
 */
export async function saveBattleRecord(payload) {
  const safe = {
    start: payload.start ?? 0,
    end: payload.end ?? 0,
    roundsPlayed: payload.roundsPlayed ?? 0,
    winner: payload.winner ?? "enemy",
    userId: payload.userId ?? null,
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "battles"), safe);
  console.log("✅ battles written docId:", ref.id);
  return ref.id;
}

