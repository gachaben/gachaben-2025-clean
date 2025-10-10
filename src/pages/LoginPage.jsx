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
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/firebase";
import NoteTrack from "@/components/ui/NoteTrack";

const auth = getFirebaseAuth();
const db = getFirestoreDb();

async function ensureUserDoc(uid, email) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: email ?? "",
      role: "user",
      rewardAttempts: 0,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
    return { role: "user", rewardAttempts: 0 };
  } else {
    await updateDoc(ref, { lastLoginAt: serverTimestamp() });
    return snap.data();
  }
}

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [attempts, setAttempts] = useState(0);

  // --- ログイン済みなら Firestore からユーザーデータ取得 ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const data = await ensureUserDoc(u.uid, u.email || "");
        setUser(u);
        setAttempts(data.rewardAttempts || 0);
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  // --- 広告視聴ボタン（挑戦＋保存） ---
  async function handleWatchAd() {
    if (!user) return alert("ログインしてください！");
    const ref = doc(db, "users", user.uid);
    const newAttempts = attempts + 1;

    await updateDoc(ref, { rewardAttempts: newAttempts });
    setAttempts(newAttempts);

    if (newAttempts >= 7) {
      console.log("🌈 プレミアム確定ガチャ発動！");
      await updateDoc(ref, { rewardAttempts: 0 }); // リセット
      setTimeout(() => setAttempts(0), 1000);
    }
  }

  // --- 通常ログイン or 登録 ---
  async function handleLogin(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass).catch(
        async (err) => {
          if (err.code === "auth/user-not-found") {
            return await createUserWithEmailAndPassword(auth, email, pass);
          }
          throw err;
        }
      );
      const data = await ensureUserDoc(cred.user.uid, cred.user.email || "");
      setUser(cred.user);
      setAttempts(data.rewardAttempts || 0);
    } catch (e) {
      console.error("AUTH ERROR:", e);
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  // --- ログイン済み画面 ---
  if (user) {
    const progress = (attempts / 7) * 100;
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-yellow-100 to-yellow-300">
        <h1 className="text-lg font-bold text-yellow-800 mb-4">
          🎁 プレミアムガチャチャンス
        </h1>

        <NoteTrack
          progress={progress}
          onFull={() => console.log("🌈 ドレミ×2 キュイーン発動！")}
        />

        <p className="text-sm mt-4 text-gray-700">
          挑戦回数：{attempts}/7
        </p>

        <button
          onClick={handleWatchAd}
          className="mt-4 px-4 py-2 rounded-lg bg-yellow-500 text-white font-bold shadow-lg hover:bg-yellow-400 transition"
        >
          🎬 広告を見てプレミアムガチャに挑戦！
        </button>

        <button
          onClick={() => {
            auth.signOut();
            setUser(null);
          }}
          className="mt-6 text-xs text-gray-500 underline"
        >
          ログアウト
        </button>
      </div>
    );
  }

  // --- 未ログイン画面 ---
  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-lg font-bold">🔒 ログイン</h1>

      <form onSubmit={handleLogin} className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm text-neutral-600">メールアドレス</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-neutral-600">パスワード</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
          />
        </div>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 rounded bg-blue-600 text-white font-bold shadow-md hover:bg-blue-500 transition ${
            loading ? "opacity-50" : ""
          }`}
        >
          {loading ? "処理中..." : "ログイン / 新規登録"}
        </button>
      </form>
    </div>
  );
}
