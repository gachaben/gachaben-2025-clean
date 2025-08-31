// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// fbkit 経由でインスタンス取得
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const auth = getFirebaseAuth();
    const db = getFirestoreDb();
    const emailNorm = email.trim().toLowerCase();
    const passRaw = password;

    // 事前バリデーション
    if (!emailNorm) {
      setError("メールアドレスを入力してください");
      return;
    }
    if (!passRaw || passRaw.length < 6) {
      setError("パスワードは6文字以上にしてください");
      return;
    }

    try {
      let user;

      // ① サインイン
      try {
        const result = await signInWithEmailAndPassword(auth, emailNorm, passRaw);
        user = result.user;
      } catch (err) {
        console.error("AUTH ERROR:", err);
        alert(`${err.code} / ${err.message}`);

        // ② 未登録なら作成にフォールバック
        if (err?.code === "auth/user-not-found") {
          try {
            const result = await createUserWithEmailAndPassword(auth, emailNorm, passRaw);
            user = result.user;
          } catch (ce) {
            if (ce?.code === "auth/weak-password") {
              setError("パスワードは6文字以上にしてください（weak-password）");
            } else if (ce?.code === "auth/invalid-email") {
              setError("メールアドレスの形式が正しくありません（invalid-email）");
            } else if (ce?.code === "auth/email-already-in-use") {
              setError("このメールは既に使われています（email-already-in-use）");
            } else {
              setError(`新規作成に失敗しました: ${ce?.code || ce?.message}`);
            }
            console.error("[Login create] error:", ce);
            return;
          }
        } else if (err?.code === "auth/invalid-email") {
          setError("メールアドレスの形式が正しくありません（invalid-email）");
          return;
        } else if (err?.code === "auth/wrong-password") {
          setError("パスワードが違います（wrong-password）");
          return;
        } else {
          setError(`サインイン失敗: ${err?.code || err?.message}`);
          console.error("[Login signIn] error:", err);
          return;
        }
      }

      // ③ users/{uid} を初期作成 or 補完
      const ref = doc(db, "users", user.uid);
      let snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, { email: emailNorm, role: "child", createdAt: serverTimestamp() });
        snap = await getDoc(ref);
      } else if (!(snap.data() || {}).role) {
        await setDoc(ref, { role: "child" }, { merge: true });
        snap = await getDoc(ref);
      }

      // ④ role で遷移
      const data = snap.data() || {};
      const role = data?.role ?? "child";
      if (role === "parent") navigate("/parent-home");
      else if (role === "admin") navigate("/admin-reward");
      else navigate(data?.parentId ? "/child-home" : "/link-family");
    } catch (err) {
      setError(`ログインに失敗しました: ${err?.code || err?.message}`);
      console.error("[Login] error:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 px-4">
      <h1 className="text-3xl font-bold mb-6">🔐 ログイン</h1>

      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md"
      >
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="パスワード（6文字以上）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
          required
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          ログイン / 新規登録
        </button>
      </form>
    </div>
  );
}
