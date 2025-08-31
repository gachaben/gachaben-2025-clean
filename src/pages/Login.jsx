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

    try {
      let user;

      // ① サインインを試す
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

      // ② users/{uid} を初期作成 or 補完
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

      // ③ role を読んで遷移先を決める
      const data = snap.data() || {};
      const role = data?.role ?? "child";

      if (role === "parent") {
        navigate("/parent-home");
      } else if (role === "admin") {
        navigate("/admin-reward");
      } else {
        // child の場合
        navigate(data?.parentId ? "/child-home" : "/link-family");
      }
    } catch (err) {
      // エラーハンドリング
      if (err?.code === "auth/wrong-password") {
        setError("パスワードが違います");
      } else if (err?.code === "auth/too-many-requests") {
        setError("試行回数が多すぎます。しばらくしてからお試しください");
      } else if (err?.code === "auth/invalid-email") {
        setError("メールアドレスの形式が正しくありません");
      } else {
        setError("ログインに失敗しました: " + (err?.message ?? ""));
      }
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
