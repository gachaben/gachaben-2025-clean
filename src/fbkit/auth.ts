// src/fbkit/auth.ts
// ------------------------------------------------------
// ✅ ensureSignedIn（v1.3.1 準拠）
// Firebase Auth の状態を保証。
// 未ログイン時は匿名サインインを実行。
// ------------------------------------------------------

import { getFirebaseAuth } from "./app";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";

/**
 * サインイン状態を保証する。
 * - 既にログイン済みならそのユーザーを返す。
 * - 未ログインなら匿名ログインを実行して user を返す。
 */
export async function ensureSignedIn() {
  const auth = getFirebaseAuth();

  // すでにログイン済みなら即返す
  if (auth.currentUser) {
    return auth.currentUser;
  }

  // 状態監視して確実にユーザーを返す
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        unsubscribe();

        if (user) {
          // 既存ユーザー
          console.log("[FBKIT] ensureSignedIn: existing user", user.uid);
          resolve(user);
        } else {
          try {
            // 匿名ログインを実行
            const result = await signInAnonymously(auth);
            console.log("[FBKIT] ensureSignedIn: signed in anonymously", result.user.uid);
            resolve(result.user);
          } catch (err) {
            console.error("[FBKIT] ensureSignedIn failed:", err);
            reject(err);
          }
        }
      },
      reject
    );
  });
}
