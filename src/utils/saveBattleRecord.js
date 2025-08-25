// バトル結果の保存と取得（最小実装）
import { db } from "@/fbkit"; // いまは "@/fbkit" で揃えてOK
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from "firebase/firestore";

export async function saveBattleRecord({ uid, opponent = "NPC", result = "win", score = 0, meta = {} }) {
  if (!uid) throw new Error("saveBattleRecord: uid is required");
  const col = collection(db, "battleRecords");
  const docRef = await addDoc(col, {
    uid, opponent, result, score, meta, createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getRecentBattleRecords(uid, max = 20) {
  const col = collection(db, "battleRecords");
  const q = query(col, where("uid", "==", uid), orderBy("createdAt", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
