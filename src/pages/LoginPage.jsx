// src/pages/LoginPage.jsx
import React, { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../legacy_deprecated/firebase";

export default function LoginPage() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password");
  const [name, setName] = useState("Demo User");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const un = onAuthStateChanged(auth, (u) => setUser(u));
    return () => un();
  }, []);

  const doAnon = async () => {
    setMsg("");
    try {
      await signInAnonymously(auth);
      setMsg("匿名ログインしました");
    } catch (e) {
      setMsg(`匿名ログイン失敗: ${e.message}`);
    }
  };

  const doSignup = async () => {
    setMsg("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(cred.user, { displayName: name });
      setMsg("ユーザー作成できました");
    } catch (e) {
      setMsg(`作成失敗: ${e.message}`);
    }
  };

  const doSignin = async () => {
    setMsg("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMsg("ログイン成功");
    } catch (e) {
      setMsg(`ログイン失敗: ${e.message}`);
    }
  };

  const doSignout = async () => {
    setMsg("");
    try {
      await signOut(auth);
      setMsg("ログアウトしました");
    } catch (e) {
      setMsg(`ログアウト失敗: ${e.message}`);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>ログイン</h2>
      <div style={{ marginBottom: 8 }}>
        現在のUID: <code>{user?.uid ?? "(未ログイン)"}</code>
      </div>

      <div style={{ display: "grid", gap: 8, maxWidth: 360 }}>
        <label>
          名前：
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border px-2 py-1 rounded w-full"
          />
        </label>
        <label>
          メール：
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-2 py-1 rounded w-full"
          />
        </label>
        <label>
          パスワード：
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border px-2 py-1 rounded w-full"
          />
        </label>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="border px-3 py-2 rounded" onClick={doSignin}>
            メール/パスワードでログイン
          </button>
          <button className="border px-3 py-2 rounded" onClick={doSignup}>
            メール/パスワードで作成（無ければ作成）
          </button>
          <button className="border px-3 py-2 rounded" onClick={doAnon}>
            匿名ログイン
          </button>
          <button className="border px-3 py-2 rounded" onClick={doSignout}>
            ログアウト
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ marginTop: 12, color: "#333" }}>
          <strong>{msg}</strong>
        </div>
      )}
    </div>
  );
}
