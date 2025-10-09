// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { onAuthStateChanged, getAuth } from "firebase/auth";

// ==== ページ ==== //
import HomePage from "@/pages/HomePage.jsx";
import Login from "@/pages/Login.jsx";
import BattlePage from "@/pages/BattlePage.jsx";
import DebugPage from "@/pages/DebugPage.jsx";
import DoReMiBoard from "@/pages/DoReMiBoard.jsx";

// ==== 復習モード関連 ==== //
import ReviewHomePage from "@/pages/ReviewHomePage.jsx";
import ReviewQuickStart from "@/pages/ReviewQuickStart.jsx";
import ReviewMistakesPage from "@/pages/ReviewMistakesPage.jsx";
import ReviewListPage from "@/pages/ReviewListPage.jsx";
import ReviewPlayPage from "@/pages/ReviewPlayPage.jsx";
import ReviewSessionStart from "@/pages/ReviewSessionStart.jsx";

// ==== ハートシステム ==== //
import { HeartsProvider } from "@/context/HeartsContext";
import TopBar from "@/components/TopBar";

// ==== 認証ガード ==== //
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

// ==== ナビ（開発用） ==== //
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

// ==== ルーティング本体 ==== //
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

          {/* ==== バトル（ログイン必須） ==== */}
          <Route
            path="/battle"
            element={
              <RequireAuth>
                <BattlePage />
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
