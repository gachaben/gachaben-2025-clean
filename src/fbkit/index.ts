// src/fbkit/index.ts
import { getFirebaseApp, getFirestoreDb, getFirebaseAuth, getFirebaseStorage } from "./app";
export * from "./config";

// 個別関数をまとめて export
export { getFirebaseApp } from "./app";
export { getFirestoreDb } from "./app";
export { getFirebaseAuth } from "./app";
export { getFirebaseStorage } from "./app";


// 便利エイリアス
export const db = getFirestoreDb();
