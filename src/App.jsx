// ------------------------------------------------------
// 🚀 src/App.jsx（v3.0 / BattlePlayPage対応＋安定版）
// ------------------------------------------------------

import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { onAuthStateChanged, getAuth } from "firebase/auth";

// ==== 各ページインポート ====
import ChallengeTestPage from "@/pages/ChallengeTestPage.jsx";
import LessonTestPage from "@/pages/LessonTestPage.jsx";
import ActiveTimeTestPage from "@/pages/ActiveTimeTestPage.jsx";
import HomePage from "@/pages/HomePage.jsx";
import LoginPage from "@/pages/LoginPage.jsx";
import DebugPage from "@/pages/DebugPage.jsx";
import DoReMiBoard from "@/pages/DoReMiBoard.jsx";
import StudyPage from "@/pages/StudyPage.jsx";
import MissionGachaPage from "@/pages/MissionGachaPage.jsx";
import PremiumGachaPage from "@/pages/PremiumGachaPage.jsx";
import AppOpeningScene from "@/pages/AppOpeningScene.jsx";
import BattleChallengePage from "@/pages/BattleChallengePage.jsx";
import BattlePlayPage from "@/pages/BattlePlayPage.jsx"; // ✅ 追加済み
import BattleResultPage from "@/pages/BattleResultPage.jsx";
import BattleHistoryPage from "@/pages/BattleHistoryPage.jsx";
import ReviewHomePage from "@/pages/ReviewHomePage.jsx";
import ReviewQuickStart from "@/pages/ReviewQuickStart.jsx";
import ReviewMistakesPage from "@/pages/ReviewMistakesPage.jsx";
import ReviewListPage from "@/pages/ReviewListPage.jsx";
import ReviewPlayPage from "@/pages/ReviewPlayPage.jsx";
import ReviewSessionStart from "@/pages/ReviewSessionStart.jsx";
import ChallengeSelectPage from "@/pages/ChallengeSelectPage.jsx";
import ChallengePlayPage from "@/pages/ChallengePlayPage.jsx";
import ChallengeResultPage from "@/pages/ChallengeResultPage.jsx";
import ChallengeRetryPage from "@/pages/ChallengeRetryPage.jsx";
import BattleBonusPage from "@/pages/BattleBonusPage.jsx";

// ==== コンテキスト・共通 ====
import { HeartsProvider } from "@/context/HeartsContext";
import TopBar from "@/components/TopBar";

// ------------------------------------------------------
// 🔐 認証状態管理
// ------------------------------------------------------
function useAuthState() {
  const [state, setState] = React.useState({ user: null, loading: true });
  React.useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), (u) => {
      setState({ user: u, loading: false });
    });
    return () => unsub();
  }, []);
  return state;
}

function RequireAuth({ children }) {
  const { user, loading } = useAuthState();
  if (loading) return <div className="p-4 text-center">認証確認中...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ------------------------------------------------------
// 🧭 開発用ナビゲーションバー
// ------------------------------------------------------
function Nav() {
  return (
    <nav className="p-2 flex flex-wrap gap-3 text-sm bg-gray-50 border-b justify-center">
      <Link to="/">🏠 Home</Link>
      <Link to="/login">🔑 Login</Link>
      <Link to="/review">📘 Review</Link>
      <Link to="/battle">🥊 Battle</Link>
      <Link to="/doremi">🎵 DoReMi</Link>
      <Link to="/debug">🧭 Debug</Link>
      <Link to="/opening">🌅 Opening</Link>
      <Link to="/mission-gacha">🎰 Mission</Link>
      <Link to="/premium-gacha">🌈 Premium</Link>
    </nav>
  );
}

// ------------------------------------------------------
// 🚀 アプリ本体
// ------------------------------------------------------
export default function App() {
  const { user, loading } = useAuthState();

  if (loading)
    return <div className="p-6 text-center text-gray-500">起動中...</div>;

  return (
    <HeartsProvider>
      <TopBar />
      <div className="pt-12">
        <Nav />

        <Routes>
          {/* ==== 基本ページ ==== */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/debug" element={<DebugPage />} />
          <Route path="/doremi" element={<DoReMiBoard />} />
          <Route path="/lesson-test" element={<LessonTestPage />} />
          <Route path="/challenge-test" element={<ChallengeTestPage />} />
          <Route path="/active-test" element={<ActiveTimeTestPage />} />
          <Route path="/study" element={<StudyPage />} />

          {/* ==== チャレンジ ==== */}
          <Route path="/challenge" element={<ChallengeSelectPage />} />
          <Route path="/challenge/play" element={<ChallengePlayPage />} />
          <Route path="/challenge/result" element={<ChallengeResultPage />} />
          <Route path="/challenge/retry" element={<ChallengeRetryPage />} />

          {/* ==== バトル関連 ==== */}
          <Route
  path="/battle"
  element={
    <RequireAuth>
      <BattlePlayPage />   {/* ← ここを BattleChallengePage から切り替え */}
    </RequireAuth>
  }
/>

          <Route
            path="/battle/challenge"
            element={
              <RequireAuth>
                <BattleChallengePage user={{ grade: 3 }} />
              </RequireAuth>
            }
          />
          <Route
            path="/battle/play"
            element={
              <RequireAuth>
                <BattlePlayPage />
              </RequireAuth>
            }
          />
          <Route
            path="/battle/result"
            element={
              <RequireAuth>
                <BattleResultPage />
              </RequireAuth>
            }
          />
          <Route
            path="/battle/history"
            element={
              <RequireAuth>
                <BattleHistoryPage />
              </RequireAuth>
            }
          />
<Route
  path="/battle/bonus"
  element={
    <RequireAuth>
      <BattleBonusPage />
    </RequireAuth>
  }
/>




          {/* ==== ミッションガチャ ==== */}
          <Route
            path="/mission-gacha"
            element={
              <RequireAuth>
                <MissionGachaPage />
              </RequireAuth>
            }
          />

          {/* ==== プレミアムガチャ ==== */}
          <Route
            path="/premium-gacha"
            element={
              <RequireAuth>
                <PremiumGachaPage />
              </RequireAuth>
            }
          />

          {/* ==== 起動画面 ==== */}
          <Route path="/opening" element={<AppOpeningScene />} />

          {/* ==== 復習モード ==== */}
          <Route path="/review" element={<ReviewHomePage />} />
          <Route path="/review/quick" element={<ReviewQuickStart />} />
          <Route path="/review/mistakes" element={<ReviewMistakesPage />} />
          <Route path="/review/list" element={<ReviewListPage />} />
          <Route path="/review/play/:id" element={<ReviewPlayPage />} />
          <Route path="/review/session" element={<ReviewSessionStart />} />

          {/* ==== 未定義URLはトップへ ==== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HeartsProvider>
  );
}
