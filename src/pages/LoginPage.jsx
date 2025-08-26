// src/pages/LoginPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/firebase";

const auth = getFirebaseAuth();
const db = getFirestoreDb();

async function ensureUserDoc(uid, email) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: email ?? "",
      role: "user",                 // 既定は user
      displayName: "",
      displayNameLower: "",
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
    return { role: "user" };
  } else {
    // 既存ユーザーは lastLoginAt を更新（軽量化のため setDoc は使わない）
    // createdAt は既存のままにする
    try {
      await setDoc(ref, { lastLoginAt: serverTimestamp() }, { merge: true });
    } catch {}
    return snap.data() || { role: "user" };
  }
}

function redirectByRole(navigate, role) {
  if (role === "banned") {
    navigate("/banned", { replace: true });
    return;
  }
  if (role === "admin") {
    navigate("/history", { replace: true });
    return;
  }
  navigate("/", { replace: true });
}

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // すでにログイン済みなら → role を見て自動遷移
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      try {
        const data = await ensureUserDoc(u.uid, u.email || "");
        redirectByRole(nav, data.role || "user");
      } catch (e) {
        console.error("[auth] role redirect error", e);
      }
    });
    return () => unsub();
  }, [nav]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const cred = mode === "login"
        ? await signInWithEmailAndPassword(auth, email, pass)
        : await createUserWithEmailAndPassword(auth, email, pass);

      // ユーザードキュメントの整備 → ロールで遷移
      const data = await ensureUserDoc(cred.user.uid, cred.user.email || "");
      redirectByRole(nav, data.role || "user");
    } catch (e) {
      console.error("[auth]", e);
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-lg font-bold">Login</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm text-neutral-600">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-neutral-600">Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded text-sm border ${loading ? "opacity-50" : "hover:bg-gray-50"}`}
          >
            {mode === "login" ? "ログイン" : "新規登録"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-blue-600 hover:underline text-sm"
          >
            {mode === "login" ? "→ 新規登録に切替" : "→ ログインに戻る"}
          </button>
        </div>
      </form>

      <div className="text-xs text-neutral-500">
        ログイン後はロールに応じて自動遷移します：admin→/history、banned→/banned、それ以外→/
      </div>
    </div>
  );
}
