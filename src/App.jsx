// ------------------------------------------------------
// 🚀 src/App.jsx
// ガチャ弁アプリ ルーティング設定（CPU出題バトル対応 + 履歴 + 結果）
// ------------------------------------------------------
import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { onAuthStateChanged, getAuth } from "firebase/auth";

// ==== テストページ ==== //
import ChallengeTestPage from "@/pages/ChallengeTestPage.jsx";
import LessonTestPage from "@/pages/LessonTestPage.jsx";
import ActiveTimeTestPage from "@/pages/ActiveTimeTestPage.jsx";

// ==== メインページ ==== //
import HomePage from "@/pages/HomePage.jsx";
import Login from "@/pages/Login.jsx";
import DebugPage from "@/pages/DebugPage.jsx";
import DoReMiBoard from "@/pages/DoReMiBoard.jsx";

// ==== バトル関連 ==== //
import BattleChallengePage from "@/pages/BattleChallengePage.jsx";
import BattleResultPage from "@/pages/BattleResultPage.jsx";
import BattleHistoryPage from "@/pages/BattleHistoryPage.jsx";

// ==== 復習モード ==== //
import ReviewHomePage from "@/pages/ReviewHomePage.jsx";
import ReviewQuickStart from "@/pages/ReviewQuickStart.jsx";
import ReviewMistakesPage from "@/pages/ReviewMistakesPage.jsx";
import ReviewListPage from "@/pages/ReviewListPage.jsx";
import ReviewPlayPage from "@/pages/ReviewPlayPage.jsx";
import ReviewSessionStart from "@/pages/ReviewSessionStart.jsx";

// ==== ハートシステム ==== //
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
    </nav>
  );
}

// ------------------------------------------------------
// 🚀 ルーティング本体
// ------------------------------------------------------
export default function App() {
  return (
    <HeartsProvider>
      {/* ❤️ ハートバー常時表示 */}
      <TopBar />

      {/* TopBar分の余白 */}
      <div className="pt-12">
        <Nav />

        <Routes>
          {/* ==== 基本ページ ==== */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/debug" element={<DebugPage />} />
          <Route path="/doremi" element={<DoReMiBoard />} />
          <Route path="/lesson-test" element={<LessonTestPage />} />
          <Route path="/challenge-test" element={<ChallengeTestPage />} />
          <Route path="/active-test" element={<ActiveTimeTestPage />} />

          {/* ==== バトル ==== */}
          <Route
            path="/battle"
            element={
              <RequireAuth>
                <BattleChallengePage user={{ grade: 3 }} />
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
