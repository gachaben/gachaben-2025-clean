// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

// fbkit からはインスタンスを返す関数を使う
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const auth = getFirebaseAuth();
const db = getFirestoreDb();

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const emailNorm = email.trim().toLowerCase();
    const passRaw = password;

    try {
      let user;
      // 1) まずサインインを試す
      try {
        const result = await signInWithEmailAndPassword(
          auth,
          emailNorm,
          passRaw
        );
        user = result.user;
      } catch (err) {
        // ユーザーが存在しない場合 → 新規作成
        if (err.code === "auth/user-not-found") {
          const result = await createUserWithEmailAndPassword(
            auth,
            emailNorm,
            passRaw
          );
          user = result.user;
        } else {
          throw err;
        }
      }

      // 2) users/{uid} を初期用意（初回作成・既存でも不足があれば補完）
      const ref = doc(db, "users", user.uid);
      let snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, {
          email: emailNorm,
          role: "child",
          createdAt: serverTimestamp(),
        });
        snap = await getDoc(ref);
      } else {
        const d = snap.data() || {};
        if (!d.role) {
          await setDoc(ref, { role: "child" }, { merge: true });
          snap = await getDoc(ref);
        }
      }

      // 3) 安全に role を取得して遷移
      const data = snap.data() || {};
      const role = data?.role ?? "child";

      if (role === "parent") navigate("/parent-home");
      else if (role === "admin") navigate("/admin-reward");
      else navigate(data?.parentId ? "/child-home" : "/link-family");
    } catch (err) {
      if (
        err?.code === "auth/wrong-password" ||
        err?.message === "INVALID_PASSWORD"
      ) {
        setError("パスワードが違います");
      } else if (err?.code === "auth/too-many-requests") {
        setError("試行回数が多すぎます。しばらくしてからお試しください");
      } else {
        setError("ログインに失敗しました: " + (err?.message ?? ""));
      }
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
          placeholder="パスワード"
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
