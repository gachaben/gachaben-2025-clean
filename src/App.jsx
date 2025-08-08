// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* ===== ユーザー認証・プロフィール関連 ===== */
import Login from "./pages/Login";
import RegisterPage from "./pages/RegisterPage";
import SelectOshiPage from "./pages/SelectOshiPage";
import MyProfilePage from "./pages/MyProfilePage";
import RegisterStageTest from "./pages/RegisterStageTest";

/* ===== ホーム・学習・ストーリー関連 ===== */
import ChildHomePage from "./pages/ChildHomePage";
import DailyQuizPage from "./pages/DailyQuizPage";
import StoryMissionEndPage from "./pages/StoryMissionEndPage";

/* ===== 図鑑関連 ===== */
import ZukanTopPage from "./pages/ZukanTopPage";
import ZukanDetailPage from "./pages/ZukanDetailPage";
import ZukanSeriesPage from "./pages/ZukanSeriesPage";
import ItemDetailPage from "./pages/ItemDetailPage";
// import ItemDetailPage2 from "./pages/ItemDetailPage2";
import ZukanInsectDetailPage from "./pages/ZukanInsectDetailPage";

/* ===== バトル関連 ===== */
import BattleLanding from "./pages/BattleLanding";
import BattleRankSelect from "./pages/BattleRankSelect";
import BattleItemSelectPage from "./pages/BattleItemSelectPage";
import BattlePlayPage from "./pages/BattlePlayPage";
import BattleResultPage from "./pages/BattleResultPage";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* デフォルトはログインへ */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 認証・プロフィール */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/select-oshi" element={<SelectOshiPage />} />
        <Route path="/my-profile" element={<MyProfilePage />} />
        <Route path="/register-stage" element={<RegisterStageTest />} />

        {/* ホーム・学習・ストーリー */}
        <Route path="/child-home" element={<ChildHomePage />} />
        <Route path="/daily-quiz" element={<DailyQuizPage />} />
        <Route path="/story-mission-end" element={<StoryMissionEndPage />} />

        {/* 図鑑 */}
        <Route path="/login/zukan" element={<ZukanTopPage />} />
        <Route path="/zukan" element={<ZukanDetailPage />} />
        <Route path="/zukan/:seriesId" element={<ZukanSeriesPage />} />
        <Route path="/zukan/:seriesId/:rank" element={<ZukanSeriesPage />} />
        <Route path="/zukan/:seriesId/:rank/:name" element={<ZukanInsectDetailPage />} />
        <Route path="/zukan-detail/:itemId" element={<ItemDetailPage />} />
        <Route path="/zukan-detail" element={<ZukanDetailPage />} />

        {/* バトル */}
        <Route path="/battle" element={<BattleLanding />} />
        <Route path="/battle/rank" element={<BattleRankSelect />} />
        <Route path="/battle/play" element={<BattlePlayPage />} />
        <Route path="/battle/result" element={<BattleResultPage />} />
        <Route path="/battle/item-select" element={<BattleItemSelectPage />} />
      </Routes>
    </BrowserRouter>
  );
}
