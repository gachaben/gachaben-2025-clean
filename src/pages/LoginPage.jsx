// ------------------------------------------------------
// src/pages/LoginPage.jsx（統合版・最新版）
// ------------------------------------------------------
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";

// ------------------------------------------------------
// 🧩 ensureUserDoc()
// Firestoreにユーザーデータがなければ自動初期化。
// 新規登録時に hearts / battleTickets / doremiPoints などを追加。
// ------------------------------------------------------
async function ensureUserDoc(uid, email) {
  const db = getFirestoreDb();
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const initialData = {
      email: email ?? "",
      role: "user",
      rewardAttempts: 0,
      hearts: 5,
      lastAdHeartsAt: null,
      battleTickets: 3,
      lastAdTicketsAt: null,
      doremiPoints: 0,
      doremiRank: "ビギナー",
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };
    await setDoc(ref, initialData);
    console.log("✅ user initialized (new):", uid);
    return initialData;
  } else {
    const data = snap.data();
    const update = {};

    // 欠けているフィールドを自動補完
    if (data.hearts == null) update.hearts = 5;
    if (data.lastAdHeartsAt == null) update.lastAdHeartsAt = null;
    if (data.battleTickets == null) update.battleTickets = 3;
    if (data.lastAdTicketsAt == null) update.lastAdTicketsAt = null;
    if (data.doremiPoints == null) update.doremiPoints = 0;
    if (data.doremiRank == null) update.doremiRank = "ビギナー";

    if (Object.keys(update).length > 0) {
      await updateDoc(ref, update);
      console.log("🩷 user updated with missing fields:", update);
    }

    await updateDoc(ref, { lastLoginAt: serverTimestamp() });
    return { ...data, ...update };
  }
}

// ------------------------------------------------------
// 🔐 LoginPage コンポーネント
// ------------------------------------------------------
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const auth = getFirebaseAuth();
    const emailNorm = email.trim().toLowerCase();
    const passRaw = password;

    if (!emailNorm) return setError("メールアドレスを入力してください");
    if (!passRaw || passRaw.length < 6)
      return setError("パスワードは6文字以上にしてください");

    try {
      // ① サインイン or 新規作成
      let user;
      try {
        const result = await signInWithEmailAndPassword(auth, emailNorm, passRaw);
        user = result.user;
      } catch (err) {
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

      // ② Firestore初期化（ここで hearts, battleTickets など自動設定）
      const data = await ensureUserDoc(user.uid, user.email);

      // ③ ロールに応じて遷移
      const role = data?.role ?? "user";
      if (role === "parent") navigate("/parent-home");
      else if (role === "admin") navigate("/admin-reward");
      else navigate("/");
    } catch (err) {
      console.error("[Login] error:", err);
      setError(`ログインに失敗しました: ${err.code || err.message}`);
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

// ------------------------------------------------------
// ✅ 外部で再利用できるよう export
// ------------------------------------------------------
export { ensureUserDoc };
