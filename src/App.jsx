// src/App.jsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom";

import ZukanSeriesPage from "./pages/ZukanSeriesPage.jsx";
import BattleStartPage from "./pages/BattleStartPage.jsx";
import BattlePlayPage from "./pages/BattlePlayPage.jsx";
import AdminDataPage from "./pages/AdminDataPage.jsx";
import ReviewPage from "./pages/ReviewPage.jsx";
import ReviewPlayPage from "./pages/ReviewPlayPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { writeTestBattle } from "./debug/writeTestBattle";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/review/play/:mistakeId" element={<ReviewPlayPage />} />
        <Route path="/zukan/:seriesId/:rank" element={<ZukanSeriesPage />} />
        <Route path="/battle" element={<BattleStartPage />} />
        <Route path="/battle/play" element={<BattlePlayPage />} />
        <Route path="/admin/data" element={<AdminDataPage />} />
      </Routes>

      <div style={{ padding: "1rem" }}>
        <h1>Test Firestore Write</h1>
        <button onClick={writeTestBattle}>Write battles test</button>
        <div style={{ marginTop: 8 }}>
          <Link to="/login">ログイン</Link> / <Link to="/review">復習へ</Link> /{" "}
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
        <Link to="/admin/data">管理</Link>
      </p>
    </div>
  );
}
