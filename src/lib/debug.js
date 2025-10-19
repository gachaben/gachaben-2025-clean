// ------------------------------------------------------
// src/lib/debug.js
// Firestore デバッグ用ユーティリティ
// ------------------------------------------------------
import { getDocs, collection } from "firebase/firestore";
import { getFirestoreDb } from "@/fbkit";

// ✅ コレクションの全データを表示
export async function listCollection(name) {
  const db = getFirestoreDb();
  const snap = await getDocs(collection(db, name));
  console.log(`=== ${name} (${snap.size}) ===`);
  snap.forEach((doc) => console.log(doc.id, doc.data()));
}

// ✅ コレクションの件数だけ表示
export async function countCollection(name) {
  const db = getFirestoreDb();
  const snap = await getDocs(collection(db, name));
  console.log(`=== ${name} count: ${snap.size} ===`);
  return snap.size;
}
