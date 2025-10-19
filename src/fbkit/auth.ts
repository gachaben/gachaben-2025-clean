// ------------------------------------------------------
// src/fbkit/auth.ts
// Firebase 認証ユーティリティ（Emulator対応・安定版）
// ------------------------------------------------------
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/fbkit/app";

// ✅ サインイン確認関数
export async function ensureSignedIn(): Promise<User | null> {
  const auth = getAuth(app);
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

// ✅ 現在のユーザーを返す関数
export function getCurrentUser() {
  const auth = getAuth(app);
  return auth.currentUser;
}

console.log("[FBKIT] auth.ts initialized (ensureSignedIn ready)");
