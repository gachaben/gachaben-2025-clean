// src/App.jsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom";

import LinkAccountPage from "./pages/LinkAccountPage";
import ZukanSeriesPage from "./pages/ZukanSeriesPage.jsx";
import BattleStartPage from "./pages/BattleStartPage.jsx";
import BattlePlayPage from "./pages/BattlePlayPage.jsx";
import AdminDataPage from "./pages/AdminDataPage.jsx";

// 復習まわり
import ReviewQuickStart from "./pages/ReviewQuickStart";      // 一覧&フィルタ
import ReviewPlayPage from "./pages/ReviewPlayPage.jsx";      // 1問プレイ
import ReviewSessionStart from "./pages/ReviewSessionStart.jsx"; // ★ 連続復習スタート
import ReviewResultPage from "./pages/ReviewResultPage.jsx";     // ★ 結果

import LoginPage from "./pages/LoginPage.jsx";
import { writeTestBattle } from "./debug/writeTestBattle";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* ログイン */}
        <Route path="/login" element={<LoginPage />} />

        {/* 復習：クイック一覧（/review はこれに統一） */}
        <Route path="/review" element={<ReviewQuickStart />} />
        {/* 連続復習スタート＆結果 */}
        <Route path="/review/start" element={<ReviewSessionStart />} />
        <Route path="/review/result" element={<ReviewResultPage />} />
        {/* 復習：1問プレイ */}
        <Route path="/review/play/:id" element={<ReviewPlayPage />} />

        {/* 図鑑・バトル */}
        <Route path="/zukan/:seriesId/:rank" element={<ZukanSeriesPage />} />
        <Route path="/battle" element={<BattleStartPage />} />
        <Route path="/battle/play" element={<BattlePlayPage />} />

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
          <Link to="/admin/data">管理</Link>
        </div>
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
        <Link to="/login">ログイン</Link> /{" "}
        <Link to="/review" className="underline text-blue-600">クイック復習</Link> /{" "}
        <Link to="/review/start" className="underline text-green-700">連続復習</Link> /{" "}
        <Link to="/admin/data">管理</Link>
      </p>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ padding: 16 }}>
      <h2>ページが見つかりません</h2>
      <p><Link to="/">ホームへ戻る</Link></p>
    </div>
  );
}
