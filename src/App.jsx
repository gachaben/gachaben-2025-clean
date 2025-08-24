// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirebaseAuth } from "@/firebase";

// ✅ 入口を1本化：互換ハブ（src/fbkit/index.ts）経由
import { db } from "@/firebase";

// Firestore（デバッグ／書き込み）
import { onSnapshot, doc, setDoc, serverTimestamp } from "firebase/firestore";

// 既存ページ
import LinkAccountPage from "./pages/LinkAccountPage";
import ZukanTopPage from "./pages/ZukanTopPage.jsx";
import ZukanListPage from "./pages/ZukanListPage.jsx";
import ZukanSeriesPage from "./pages/ZukanSeriesPage.jsx";
import BattleStartPage from "./pages/BattleStartPage.jsx";
import BattlePlayPage from "./pages/BattlePlayPage.jsx";
import BattleResultPage from "./pages/BattleResultPage.jsx";
import AdminDataPage from "./pages/AdminDataPage.jsx";

// 復習まわり
import ReviewQuickStart from "./pages/ReviewQuickStart";
import ReviewListPage from "./pages/ReviewListPage";
import ReviewPlayPage from "./pages/ReviewPlayPage.jsx";
import ReviewSessionStart from "./pages/ReviewSessionStart.jsx";
import ReviewResultPage from "./pages/ReviewResultPage.jsx";
import ReviewQuickSeed from "./pages/ReviewQuickSeed.jsx";

import LoginPage from "./pages/LoginPage.jsx";
import { writeTestBattle } from "./debug/writeTestBattle";

// 図鑑関連
import ZukanDebugCheck from "./pages/ZukanDebugCheck.jsx";
import ZukanRankPage from "./pages/ZukanRankPage.jsx";
import ZukanSpeciesPage from "./pages/ZukanSpeciesPage.jsx";
import DarkLayout from "./layouts/DarkLayout.jsx";

// ユーザ状態（❤/日次リセット）
import { ensureUserDoc, refreshUserDaily, userDocRef } from "./lib/userState";

/** ★ 匿名ログインを保証（エミュ接続は fbkit 側で済み） */
async function ensureSignedIn() {
  const auth = getFirebaseAuth(); // ← fbkit の Auth（エミュ接続済み）
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (e) {
      console.error("anonymous sign-in failed:", e);
    }
  }
}
export default function App() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
  ensureSignedIn();
  const auth = getFirebaseAuth(); // ← 同じインスタンス
  const unSub = onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    try {
      await ensureUserDoc(user.uid);
      await refreshUserDaily(user.uid);
    } finally {
      setAuthReady(true);
    }
  });
  return () => unSub();
}, []);

  if (!authReady) {
    return <div style={{ padding: 16 }}>起動中...</div>;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* ログイン */}
        <Route path="/login" element={<LoginPage />} />

        {/* 復習 */}
        <Route path="/review" element={<ReviewQuickStart />} />
        <Route path="/review/start" element={<ReviewSessionStart />} />
        <Route path="/review/result" element={<ReviewResultPage />} />
        <Route path="/review/play/:mid" element={<ReviewPlayPage />} />
        <Route path="/review/list" element={<ReviewListPage />} />
        <Route path="/review/seed" element={<ReviewQuickSeed />} />

        {/* 図鑑（黒背景で統一） */}
        <Route
          path="/zukan"
          element={
            <DarkLayout>
              <ZukanTopPage />
            </DarkLayout>
          }
        />
        <Route
          path="/zukan/list"
          element={
            <DarkLayout>
              <ZukanListPage />
            </DarkLayout>
          }
        />
        <Route
          path="/zukan/:seriesId/:rank"
          element={
            <DarkLayout>
              <ZukanSeriesPage />
            </DarkLayout>
          }
        />
        <Route
          path="/zukan/rank/:rank"
          element={
            <DarkLayout>
              <ZukanRankPage />
            </DarkLayout>
          }
        />
        <Route
          path="/zukan/:rank/:species"
          element={
            <DarkLayout>
              <ZukanSpeciesPage />
            </DarkLayout>
          }
        />
        <Route
          path="/debug/zukan-check"
          element={
            <DarkLayout>
              <ZukanDebugCheck />
            </DarkLayout>
          }
        />

        {/* バトル */}
        <Route path="/battle" element={<BattleStartPage />} />
        <Route path="/battle/play" element={<BattlePlayPage />} />
        <Route path="/battle/result" element={<BattleResultPage />} />

        {/* 管理・連携 */}
        <Route path="/admin/data" element={<AdminDataPage />} />
        <Route path="/link-account" element={<LinkAccountPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* デバッグセクション（任意） */}
      <div style={{ padding: "1rem" }}>
        <h1>Test Firestore Write</h1>
        <button onClick={writeTestBattle}>Write battles test</button>
        <div style={{ marginTop: 8 }}>
          <Link to="/login">ログイン</Link> /{" "}
          <Link to="/review">復習へ</Link> /{" "}
          <Link to="/review/start">連続復習</Link> /{" "}
          <Link to="/review/seed">シード</Link> /{" "}
          <Link to="/zukan">図鑑トップ</Link> /{" "}
          <Link to="/admin/data">管理</Link>
        </div>

        {/* ↓↓↓ Firestore デバッグUI（今の uid/❤ を可視化 & 手動書込み） ↓↓↓ */}
        <UserDebugPanel />
        <FirestoreWriteTest />
      </div>
    </>
  );
}

function Home() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Home</h2>
      <p>
        <Link to="/battle">バトルへ</Link> /{" "}
        <Link to="/zukan" className="underline text-blue-600">
          図鑑トップ
        </Link>{" "}
        / <Link to="/login">ログイン</Link> /{" "}
        <Link to="/review" className="underline text-blue-600">
          クイック復習
        </Link>{" "}
        /{" "}
        <Link to="/review/start" className="underline text-green-700">
          連続復習
        </Link>{" "}
        / <Link to="/admin/data">管理</Link>
      </p>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ padding: 16 }}>
      <h2>ページが見つかりません</h2>
      <p>
        <Link to="/">ホームへ戻る</Link>
      </p>
    </div>
  );
}

/* ====== ここから下はデバッグ用の小さな部品 ====== */

function UserDebugPanel() {
  const uid = getAuth().currentUser?.uid;
  const [u, setU] = useState(null);

  useEffect(() => {
    if (!uid) return;
    const un = onSnapshot(userDocRef(uid), (snap) =>
      setU({ id: snap.id, ...snap.data() })
    );
    return () => un();
  }, [uid]);

  if (!uid) return null;

  return (
    <div
      style={{ marginTop: 16, padding: 12, border: "1px dashed #aaa", borderRadius: 8 }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>User Debug</div>
      <div style={{ fontSize: 14, lineHeight: 1.7 }}>
        <div>
          uid: <code>{uid}</code>
        </div>
        <div>
          hearts: <code>{u?.hearts ?? "-"}</code>
        </div>
        <div>
          battleTickets: <code>{u?.battleTickets ?? "-"}</code>
        </div>
        <div>
          daily.date: <code>{u?.daily?.date ?? "-"}</code>
        </div>
      </div>
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <button className="px-3 py-2 border rounded" onClick={() => refreshUserDaily(uid)}>
          手動 refreshUserDaily()
        </button>
      </div>
    </div>
  );
}

function FirestoreWriteTest() {
  const uid = getAuth().currentUser?.uid;
  if (!uid) return null;
  return (
    <div style={{ marginTop: 12 }}>
      <button
        className="border px-3 py-2 rounded"
        onClick={async () => {
          try {
            await setDoc(
              doc(db, "users", uid),
              { hearts: 5, createdAt: serverTimestamp() },
              { merge: true }
            );
            alert("users/" + uid + " に書き込みOK");
          } catch (e) {
            console.error("setDoc error:", e);
            alert("書き込みNG: " + (e.code || e.message));
          }
        }}
      >
        users/{uid} を作成（テスト）
      </button>
    </div>
  );
}
