// src/fbkit/auth.ts
import { getAuthInstance } from "./app";
import {
  signInAnonymously,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

export async function ensureSignedIn(): Promise<User> {
  const auth = getAuthInstance();
  if (auth.currentUser) return auth.currentUser;
  const cred = await signInAnonymously(auth);
  return cred.user;
}

export function observeAuth(cb: (u: User | null) => void) {
  return onAuthStateChanged(getAuthInstance(), cb);
}
