// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import ZukanSeriesPage from "./pages/ZukanSeriesPage.jsx";
import BattleStartPage from "./pages/BattleStartPage.jsx";
import BattlePlayPage from "./pages/BattlePlayPage.jsx";
import { writeTestBattle } from "./debug/writeTestBattle";
import AdminDataPage from "./pages/AdminDataPage.jsx";
import ReviewPage from "./pages/ReviewPage.jsx";
import LoginPage from "./pages/LoginPage.jsx"; // ← 追加

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/zukan/:seriesId/:rank" element={<ZukanSeriesPage />} />
        <Route path="/battle" element={<BattleStartPage />} />
        <Route path="/battle/play" element={<BattlePlayPage />} />
        <Route path="/admin/data" element={<AdminDataPage />} />
        <Route path="/login" element={<LoginPage />} /> {/* ← 追加 */}
        {/* 復習ページ */}
        <Route path="/review" element={<ReviewPage />} /> {/* ← 追加 */}
      </Routes>

      <div style={{ padding: "1rem" }}>
        <h1>Test Firestore Write</h1>
        <button onClick={writeTestBattle}>Write battles test</button>
        <div style={{ marginTop: 8 }}>
          <a href="/login">ログインへ</a> / <a href="/review">復習へ</a>
        </div>
      </div>
    </>
  );
}