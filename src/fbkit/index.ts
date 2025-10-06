// src/fbkit/index.ts
<<<<<<< HEAD
export {
  getFirebaseApp,
  getFirestoreDb,
  getFirebaseAuth,
  getFirebaseStorage,
} from "./app";
=======
import { getFirebaseApp, getFirestoreDb, getFirebaseAuth, getFirebaseStorage } from "./app";
export * from "./config";

// 個別関数をまとめて export
export { getFirebaseApp } from "./app";
export { getFirestoreDb } from "./app";
export { getFirebaseAuth } from "./app";
export { getFirebaseStorage } from "./app";


// 便利エイリアス
export const db = getFirestoreDb();
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)
