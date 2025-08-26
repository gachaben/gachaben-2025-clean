// src/App.jsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import HistoryPage from "./pages/HistoryPage";
import UserDetailPage from "./pages/UserDetailPage";
import BannedPage from "./pages/BannedPage";                // ← 追加
import RequireAdmin from "./components/RequireAdmin";       // ← 追加
import ReviewMistakesPage from "./pages/ReviewMistakesPage";

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 bg-white shadow-sm border-b">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="text-lg font-bold text-blue-600">gachaben reset</div>
          <nav className="flex gap-4 text-sm">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/history" className="hover:underline">History</Link>
            <Link to="/review" className="hover:underline">Review</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

function Home() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">ホーム</h1>
      <p className="text-neutral-600">簡易リセット環境。左上の Login から動作確認できます。</p>
    </div>
  );
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/banned" element={<BannedPage />} />     {/* ← 追加 */}


     {/* 一般ユーザー向け：自分の復習UI（ログイン前提） */}
     <Route path="/review" element={<ReviewMistakesPage />} />


        {/* 管理者専用ルート */}
        <Route
          path="/history"
          element={
            <RequireAdmin>
              <HistoryPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/users/:uid"
          element={
            <RequireAdmin>
              <UserDetailPage />
            </RequireAdmin>
          }
        />
      </Routes>
    </Shell>
  );
}
