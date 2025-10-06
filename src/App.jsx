// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { onAuthStateChanged, getAuth } from "firebase/auth";

// ページ
<<<<<<< HEAD
import HomePage from "@/pages/HomePage.jsx";
import Login from "@/pages/Login.jsx";
import HistoryPage from "@/pages/HistoryPage.jsx";
import ReviewPage from "@/pages/ReviewPage.jsx";
import BattlePage from "@/pages/BattlePage.jsx";

// ▼ 追加：復習系ページ
import ReviewMistakesPage from "@/pages/ReviewMistakesPage.jsx";
import ReviewSessionStart from "@/pages/ReviewSessionStart.jsx";
import ReviewPlayPage from "@/pages/ReviewPlayPage.jsx";
=======
import HomePage from "@/pages/HomePage.jsx";   // ← alias で OK
import Login from "@/pages/Login.jsx";
import HistoryPage from "@/pages/HistoryPage.jsx";     // なければコメントアウト
import ReviewPage from "@/pages/ReviewPage.jsx";       // Mistakes 一覧ページ
import ReviewPlayPage from "@/pages/ReviewPlayPage.jsx"; // ★ 復習プレイ用ページ
import BattlePage from "@/pages/BattlePage.jsx";
import ProblemsTestPage from "@/pages/ProblemsTestPage.jsx"; // Firestore テスト用
import DebugPage from "@/pages/DebugPage.jsx";
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)

// ---- シンプルな認証ガード ----
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
  if (loading) return <div className="p-4">Checking auth…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ---- ナビ（任意） ----
function Nav() {
  return (
    <nav className="p-2 flex gap-4 text-sm">
      <Link to="/">Home</Link>
      <Link to="/login">Login</Link>
      <Link to="/history">History</Link>
      <Link to="/review">Review</Link>
      <Link to="/review-mistakes">Review(Mistakes)</Link> {/* ← 追加 */}
      <Link to="/battle">Battle</Link>
      <Link to="/problems-test">ProblemsTest</Link>
      <Link to="/debug">Debug</Link>
    </nav>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/review/play/:id" element={<ReviewPlayPage />} /> {/* ★追加 */}

        {/* ここがポイント：/battle は常に定義し、表示は RequireAuth で制御 */}
        <Route
          path="/battle"
          element={
            <RequireAuth>
              <BattlePage />
            </RequireAuth>
          }
        />

        <Route path="/problems-test" element={<ProblemsTestPage />} />
        <Route path="/debug" element={<DebugPage />} />

        {/* 未定義パスはトップへ */}
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="/review" element={<ReviewHomePage />} />
        <Route path="/review/quick" element={<ReviewQuickStart />} />
        <Route path="/review/mistakes" element={<ReviewMistakesPage />} />
        <Route path="/review/list" element={<ReviewListPage />} /> 
        <Route path="/review/play/:id" element={<ReviewPlayPage />} />
        <Route path="/review/session" element={<ReviewSessionStart />} />


      </Routes>
    </>
  );
}
