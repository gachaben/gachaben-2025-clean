// src/App.jsx

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import LinkFamilyPage from "./pages/LinkFamilyPage";
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
// import ItemDetailPage2 from "./pages/ItemDetailPage2"; // ← 不要ならコメントのままでOK
import ZukanTopPage from "./pages/ZukanTopPage"; // ✅ 追加（シリーズ選択ページ）
import ZukanInsectDetailPage from "./pages/ZukanInsectDetailPage"; // ←これ！
import BattleStartPage from "./pages/BattleStartPage"; // ← 追加するページ
import BattleItemSelectPage from "./pages/BattleItemSelectPage";
import BattlePage from "./pages/BattlePage";           // ← 本バトル画面（あとで作る）
import BattleRankSelectPage from "./pages/BattleRankSelectPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ 最初にログイン画面へリダイレクト */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/link-family" element={<LinkFamilyPage />} />
        <Route path="/login/zukan" element={<ZukanTopPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/select-oshi" element={<SelectOshiPage />} />
        <Route path="/my-profile" element={<MyProfilePage />} />
        <Route path="/register-stage" element={<RegisterStageTest />} />
         {/* 既存 */}
        {/* <Route path="/parent-home" element={<ParentHome />} /> */}
        {/* <Route path="/child-home" element={<ChildHome />} /> */}
        <Route path="/daily-quiz" element={<DailyQuizPage />} />
        <Route path="/story-mission-end" element={<StoryMissionEndPage />} />
        <Route path="/zukan" element={<ZukanDetailPage />} />
        <Route path="/zukan/:seriesId" element={<ZukanSeriesPage />} />
        <Route path="/zukan-detail/:itemId" element={<ItemDetailPage />} />
        {/* <Route path="/item-detail/:itemId" element={<ItemDetailPage2 />} /> */}
        <Route path="/zukan-detail" element={<ZukanDetailPage />} />
        <Route path="/zukan/:seriesId/:rank" element={<ZukanSeriesPage />} />
        <Route path="/zukan/:seriesId/:rank/:name" element={<ZukanInsectDetailPage />} />

        {/* ✅ バトル関連 */}
        <Route path="/battle/start" element={<BattleStartPage />} />
        <Route path="/battle" element={<BattlePage />} />
        <Route path="/battle/item-select" element={<BattleRankSelectPage />} />
        {/* <Route path="/battle/result" element={<BattleResultPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
