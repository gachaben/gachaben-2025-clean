// src/App.jsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom"; // ← Link を追加
import ZukanSeriesPage from "./pages/ZukanSeriesPage.jsx";
import BattleStartPage from "./pages/BattleStartPage.jsx";
import BattlePlayPage from "./pages/BattlePlayPage.jsx";
import BattlesFeedPage from "./pages/BattlesFeedPage.jsx";
import ReviewPage from "./pages/ReviewPage.jsx";
import ReviewHub from "./components/ReviewHub.jsx";

// どこか使いたいページの JSX に
<ReviewHub />

export default function App() {
  return (
    <>
      <nav style={{ padding: 8, borderBottom: "1px solid #eee" }}>
        <Link to="/battle" style={{ marginRight: 12 }}>バトル開始</Link>
        <Link to="/battle/play" style={{ marginRight: 12 }}>プレイ中</Link>
        <Link to="/feed">最新バトル</Link>
      </nav>

      <Routes>
        <Route path="/zukan/:seriesId/:rank" element={<ZukanSeriesPage />} />
        <Route path="/battle" element={<BattleStartPage />} />
        <Route path="/battle/play" element={<BattlePlayPage />} />
        <Route path="/feed" element={<BattlesFeedPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/battle/review" element={<ReviewPage />} />
      </Routes>
    </>
  );
}
