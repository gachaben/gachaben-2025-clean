// src/App.jsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import LinkAccountPage from "./pages/LinkAccountPage";
import ZukanSeriesPage from "./pages/ZukanSeriesPage.jsx";
import BattleStartPage from "./pages/BattleStartPage.jsx";
import BattlePlayPage from "./pages/BattlePlayPage.jsx";
import AdminDataPage from "./pages/AdminDataPage.jsx";
// import ReviewPage from "./pages/ReviewPage.jsx"; // ← 使わないので削除
import ReviewPlayPage from "./pages/ReviewPlayPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { writeTestBattle } from "./debug/writeTestBattle";
import ReviewQuickStart from "./pages/ReviewQuickStart";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        {/* /review は QuickStart のみに統一 */}
        <Route path="/review" element={<ReviewQuickStart />} />
        <Route path="/review/play/:id" element={<ReviewPlayPage />} />
        <Route path="/zukan/:seriesId/:rank" element={<ZukanSeriesPage />} />
        <Route path="/battle" element={<BattleStartPage />} />
        <Route path="/battle/play" element={<BattlePlayPage />} />
        <Route path="/admin/data" element={<AdminDataPage />} />
        <Route path="/link-account" element={<LinkAccountPage />} />
        {/* 任意: 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* デバッグ用UI */}
      <div style={{ padding: "1rem" }}>
        <h1>Test Firestore Write</h1>
        <button onClick={writeTestBattle}>Write battles test</button>
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <Link to="/login">ログイン</Link>
          <span>/</span>
          <Link to="/review">復習へ</Link>
          <span>/</span>
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
      <p style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link to="/battle">バトルへ</Link>
        <span>/</span>
        <Link to="/login">ログイン</Link>
        <span>/</span>
        <Link to="/admin/data">管理</Link>
        <span>/</span>
        <Link to="/review" className="underline text-blue-600">
          クイック復習
        </Link>
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
