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

// 萓ｿ蛻ｩ繝ｪ繝輔ぃ繝ｬ繝ｳ繧ｹ
export const col = (path: string): CollectionReference<DocumentData> => collection(db, path);
export const ref = (path: string): DocumentReference<DocumentData> => doc(db, path);

// 繧ｵ繝ｼ繝先凾蛻ｻ繧貞ｿ・★蜷ｫ繧√◆縺・凾縺ｮ螳牙・譖ｸ縺崎ｾｼ縺ｿ
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

// 繧医￥菴ｿ縺・ｂ縺ｮ縺ｯ蜀阪お繧ｯ繧ｹ繝昴・繝・
export { serverTimestamp, getDoc, setDoc, updateDoc, addDoc, collection, doc };
