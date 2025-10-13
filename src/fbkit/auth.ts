// ------------------------------------------------------
// src/fbkit/auth.ts
// Firebase 認証ユーティリティ
// ------------------------------------------------------
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirebaseApp } from "./app";

// ✅ サインイン確認関数（エクスポートが必要）
export async function ensureSignedIn(): Promise<User | null> {
  const auth = getAuth(getFirebaseApp());
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(
      auth,
      (user) => {
        unsub();
        resolve(user ?? null);
      },
      (err) => reject(err)
    );
  });
}

// ✅ 現在のユーザーを返す補助関数
export function getCurrentUser() {
  const auth = getAuth(getFirebaseApp());
  return auth.currentUser;
}

console.log("[FBKIT] auth.ts initialized (ensureSignedIn ready)");
