// src/pages/LoginPage.jsx
import React, { useEffect, useState } from "react";
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
} from "../legacy_deprecated/firebase";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [msg, setMsg] = useState("");
  const [uid, setUid] = useState(auth.currentUser?.uid || "(未ログイン)");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  // ログイン状態の変化を監視して UID を更新
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? "(未ログイン)");
    });
    return () => unsub();
  }, []);

  const niceError = (err) => {
    const code = err?.code || "";
    if (code.includes("invalid-credential")) return "メールまたはパスワードが違います";
    if (code.includes("too-many-requests")) return "試行回数が多すぎます。しばらく時間をおいてください";
    return err.message || String(err);
  };

  const loginEmail = async (e) => {
    e.preventDefault();
    setMsg("");
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMsg("✅ ログインしました");
      navigate("/review");
    } catch (err) {
      // ユーザーがいなければ作成してからログイン
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          setMsg("🆕 ユーザー作成→ログインしました");
          navigate("/review");
        } catch (e2) {
          setMsg(`❌ ${niceError(e2)}`);
        }
      } else {
        setMsg(`❌ ${niceError(err)}`);
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
      navigate("/review");
    } catch (err) {
      setMsg(`❌ ${niceError(err)}`);
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
      setMsg(`❌ ${niceError(err)}`);
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
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            autoComplete="email"
          />
        </label>
        <label>
          パスワード：
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            disabled={busy}
            autoComplete="current-password"
          />
        </label>
        <button type="submit" disabled={busy}>
          {busy ? "処理中..." : "メール/パスワードでログイン（無ければ作成）"}
        </button>
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
