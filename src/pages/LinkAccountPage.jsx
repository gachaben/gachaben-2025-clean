import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, EmailAuthProvider, linkWithCredential } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

export default function LinkAccountPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [uid, setUid] = useState("");
  const [isAnon, setIsAnon] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (u) => {
      setUid(u?.uid || "");
      setIsAnon(!!u?.isAnonymous);
    });
  }, []);

  const handleLink = async (e) => {
    e.preventDefault();
    setMsg("");
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setMsg("未ログインです。まず匿名ログインしてください。");
      return;
    }
    if (!user.isAnonymous) {
      setMsg("すでに匿名ユーザーではありません（リンク不要）。");
      return;
    }
    if (!email || !pw) {
      setMsg("メールとパスワードを入力してください。");
      return;
    }

    try {
      setBusy(true);
      const cred = EmailAuthProvider.credential(email, pw);
      const res = await linkWithCredential(user, cred);
      setMsg(`リンク完了！ UIDは継続: ${res.user.uid}`);
      // そのまま戻るなら：
      // navigate("/review");
    } catch (e) {
      // 代表的なエラーだけ分かりやすく
      const code = e?.code || "";
      if (code === "auth/email-already-in-use") {
        setMsg("このメールは既存アカウントで使われています。データ移行（マージ）が必要です。");
      } else if (code === "auth/invalid-email") {
        setMsg("メールアドレスの形式が正しくありません。");
      } else if (code === "auth/weak-password") {
        setMsg("パスワードが弱すぎます（6文字以上に）。");
      } else if (code === "auth/requires-recent-login") {
        setMsg("安全のため再ログインが必要です。いったんサインインし直してください。");
      } else {
        setMsg(`リンク失敗: ${code || e.message}`);
      }
      console.error("[link] error:", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 520 }}>
      <h1 className="text-xl font-bold mb-2">匿名アカウントをメールにリンク</h1>

      <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 12 }}>
        現在のUID: <code>{uid || "—"}</code>{" "}
        {uid ? (isAnon ? "(匿名)" : "(匿名ではない)") : ""}
      </div>

      <form onSubmit={handleLink} style={{ display: "grid", gap: 8 }}>
        <input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="パスワード（6文字以上）"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          autoComplete="new-password"
        />
        <button
          type="submit"
          disabled={busy}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #09f",
            background: busy ? "#09f3" : "#09f2",
            cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          {busy ? "リンク中…" : "匿名→メールにリンクする"}
        </button>
      </form>

      {msg && (
        <div style={{ marginTop: 12, padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>
          {msg}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <Link to="/review">← 復習一覧へ戻る</Link>
      </div>
    </div>
  );
}
