// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import RegisterPage from "./pages/RegisterPage";
import SelectOshiPage from "./pages/SelectOshiPage";
import MyProfilePage from "./pages/MyProfilePage";
import RegisterStageTest from "./pages/RegisterStageTest";
import ChildHomePage from "./pages/ChildHomePage";
import DailyQuizPage from "./pages/DailyQuizPage";
import StoryMissionEndPage from "./pages/StoryMissionEndPage";
import ZukanDetailPage from "./pages/ZukanDetailPage";
import ZukanSeriesPage from "./pages/ZukanSeriesPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import ZukanTopPage from "./pages/ZukanTopPage";
import ZukanInsectDetailPage from "./pages/ZukanInsectDetailPage";
import BattleStartPage from "./pages/BattleStartPage";
import BattleItemSelectPage from "./pages/BattleItemSelectPage";
import BattlePage from "./pages/BattlePage";
import BattleRankSelectPage from "./pages/BattleRankSelectPage";
import BattlePlayPage from "./pages/BattlePlayPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login/zukan" element={<ZukanTopPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/select-oshi" element={<SelectOshiPage />} />
      <Route path="/my-profile" element={<MyProfilePage />} />
      <Route path="/register-stage" element={<RegisterStageTest />} />
      <Route path="/child-home" element={<ChildHomePage />} />
      <Route path="/daily-quiz" element={<DailyQuizPage />} />
      <Route path="/story-mission-end" element={<StoryMissionEndPage />} />
      <Route path="/zukan" element={<ZukanDetailPage />} />
      <Route path="/zukan/:seriesId" element={<ZukanSeriesPage />} />
      <Route path="/zukan-detail/:itemId" element={<ItemDetailPage />} />
      <Route path="/zukan-detail" element={<ZukanDetailPage />} />
      <Route path="/zukan/:seriesId/:rank" element={<ZukanSeriesPage />} />
      <Route path="/zukan/:seriesId/:rank/:name" element={<ZukanInsectDetailPage />} />
      {/* バトル */}
      <Route path="/battle/start" element={<BattleStartPage />} />
      <Route path="/battle/:id" element={<BattlePage />} />
      <Route path="/battle/item-select" element={<BattleRankSelectPage />} />
      <Route path="/battle/play" element={<BattlePlayPage />} />
    </Routes>
  );
}

