// src/lib/unlockNote.js
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";

export async function unlockNote(uid, newNote) {
  const db = getFirestore();
  const ref = doc(db, "users", uid);

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("ユーザーデータが見つかりません");

    const data = snap.data();
    const earned = data?.login?.earnedNotes || [];

    // すでにある場合はスキップ
    if (earned.includes(newNote)) {
      console.log(`🎵 ${newNote} はすでに解放済みです`);
      return;
    }

    // Firestore更新
    const updated = [...earned, newNote];
    await updateDoc(ref, {
      "login.earnedNotes": updated,
    });

    console.log(`🎶 ${newNote} を解放しました！`);
  } catch (err) {
    console.error("unlockNote error:", err);
  }
}
