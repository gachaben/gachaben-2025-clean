// src/fbkit/firestore.ts
import { getFirestoreDb } from "./app";
import {
  collection,
  doc,
  serverTimestamp,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  type DocumentReference,
  type CollectionReference,
  type WithFieldValue,
  type DocumentData,
} from "firebase/firestore";

export const db = getFirestoreDb();

// 便利リファレンス
export const col = (path: string): CollectionReference<DocumentData> => collection(db, path);
export const ref = (path: string): DocumentReference<DocumentData> => doc(db, path);

// サーバ時刻を必ず含めたい時の安全書き込み
export async function setWithTimestamp<T extends DocumentData>(
  r: DocumentReference<T>,
  data: WithFieldValue<T>,
) {
  return setDoc(r, { ...data, updatedAt: serverTimestamp() } as any, { merge: true });
}

export async function addWithTimestamp<T extends DocumentData>(
  c: CollectionReference<T>,
  data: WithFieldValue<T>,
) {
  return addDoc(c, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() } as any);
}

// よく使うものは再エクスポート
export { serverTimestamp, getDoc, setDoc, updateDoc, addDoc, collection, doc };
