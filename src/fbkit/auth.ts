// src/fbkit/auth.ts
import { getFirebaseAuth } from "./app";
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
  type Auth,
} from "firebase/auth";

export const auth: Auth = getFirebaseAuth();

// 匿名サインイン（必要な画面で await 呼び出し）
export async function ensureAnonymousSignIn(): Promise<User> {
  const current = auth.currentUser;
  if (current) return current;
  const cred = await signInAnonymously(auth);
  return cred.user;
}

export function observeAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

// 任意：Email/PW 用のユーティリティ
export async function emailLogin(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}
export async function emailSignup(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}
export async function logout() {
  return signOut(auth);
}
