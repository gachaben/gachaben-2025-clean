// src/fbkit/index.ts
import {
  getFirebaseApp,
  getFirestoreDb,
  getFirebaseAuth,
  getFirebaseStorage,
} from "./app";
export * from "./config";

// 便利関数の再エクスポート
export { getFirebaseApp, getFirestoreDb, getFirebaseAuth, getFirebaseStorage };

// 直接使うエイリアス
export const db = getFirestoreDb();
export const auth = getFirebaseAuth();
export const storage = getFirebaseStorage();

/**
 * ✅ ensureSignedIn()
 * Firebase Auth のログイン完了を保証するヘルパー
 */
export async function ensureSignedIn() {
  const auth = getFirebaseAuth();
  if (auth.currentUser) return auth.currentUser;

  return new Promise((resolve, reject) => {
    const unsub = auth.onAuthStateChanged((user) => {
      unsub();
      if (user) resolve(user);
      else reject(new Error("User not signed in"));
    });
  });
}
