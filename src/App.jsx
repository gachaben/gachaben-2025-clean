// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { onAuthStateChanged, getAuth } from "firebase/auth";

// ページ
import HomePage from "@/pages/HomePage.jsx";  // ← alias で OK
import Login from "@/pages/Login.jsx";
import HistoryPage from "@/pages/HistoryPage.jsx";     // なければコメントアウト
import ReviewPage from "@/pages/ReviewPage.jsx";       // なければコメントアウト
import BattlePage from "@/pages/BattlePage.jsx";
import ProblemsTestPage from "@/pages/ProblemsTestPage.jsx"; // ← 追加（Firestoreテスト用）

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
      <Link to="/battle">Battle</Link>
      <Link to="/problems-test">ProblemsTest</Link> {/* ← 確認用に追加 */}
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

        {/* /battle は常に定義し、RequireAuth で保護 */}
        <Route
          path="/battle"
          element={
            <RequireAuth>
              <BattlePage />
            </RequireAuth>
          }
        />

        {/* Firestore問題テストページ */}
        <Route path="/problems-test" element={<ProblemsTestPage />} />

        {/* 未定義パスはトップへ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
