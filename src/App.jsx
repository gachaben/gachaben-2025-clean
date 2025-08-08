// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

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
// import ItemDetailPage2 from "./pages/ItemDetailPage2"; // ← 必要なら解除
import ZukanInsectDetailPage from "./pages/ZukanInsectDetailPage";

/* ===== バトル関連 ===== */
import BattleItemSelectPage from "./pages/BattleItemSelectPage";  // アイテム選択
import BattleSelectPage from "./pages/BattleSelectPage";          // ラウンド・PW選択
import BattleStartPage from "./pages/BattleStartPage";            // スタート準備
import BattlePage from "./pages/BattlePage";                      // 本バトル画面
import BattleRankSelectPage from "./pages/BattleRankSelectPage";  // ランク選択（不要なら外す）
import BattlePlayPage from "./pages/BattlePlayPage";              // プレイ画面
import BattleResultPage from "./pages/BattleResultPage";          // 結果表示

function App() {
  return (
    <Router>
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
        <Route path="/battle/select-item" element={<BattleItemSelectPage />} />
        <Route path="/battle-select" element={<BattleSelectPage />} />
        <Route path="/battle" element={<BattlePage />} />
        <Route path="/battle/item-select" element={<BattleRankSelectPage />} />
        <Route path="/battle/play" element={<BattlePlayPage />} />
        <Route path="/battle/result" element={<BattleResultPage />} />
      </Routes>
    </Router>
  );
}

export default App;
