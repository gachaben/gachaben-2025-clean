// src/pages/LoginPage.jsx
import React, { useEffect, useState } from "react";
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
} from "../firebase";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [msg, setMsg] = useState("");
  const [uid, setUid] = useState(auth.currentUser?.uid || "(未ログイン)");
  const [busy, setBusy] = useState(false);

  // ログイン状態の変化を監視して UID を更新
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? "(未ログイン)");
    });
    return () => unsub();
  }, []);

  const loginEmail = async (e) => {
    e.preventDefault();
    setMsg("");
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMsg("✅ ログインしました");
    } catch (err) {
      // ユーザーがいなければ作成してからログイン
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
        await createUserWithEmailAndPassword(auth, email, password);
        setMsg("🆕 ユーザー作成→ログインしました");
      } else {
        setMsg(`❌ ${err.code || err.message}`);
      }
    } finally {
      setBusy(false);
    }
  };

  const loginAnon = async () => {
    setMsg("");
    setBusy(true);
    try {
      await signInAnonymously(auth);
      setMsg("✅ 匿名ログインしました");
    } catch (err) {
      setMsg(`❌ ${err.code || err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    setMsg("");
    setBusy(true);
    try {
      await signOut(auth);
      setMsg("👋 ログアウトしました");
    } catch (err) {
      setMsg(`❌ ${err.code || err.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>ログイン</h1>
      <p>現在のUID: <code>{uid}</code></p>

      <form onSubmit={loginEmail} style={{ marginTop: 12, display: "grid", gap: 8, maxWidth: 360 }}>
        <label>
          メール：
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          パスワード：
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        </label>
        <button type="submit" disabled={busy}>メール/パスワードでログイン（無ければ作成）</button>
      </form>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={loginAnon} disabled={busy}>匿名ログイン</button>
        <button onClick={logout} disabled={busy}>ログアウト</button>
      </div>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}

      <div style={{ marginTop: 16 }}>
        <Link to="/review">→ 復習ページへ</Link>
      </div>
    </div>
  );
}
