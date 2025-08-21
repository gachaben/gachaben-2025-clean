// src/App.jsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom";

import LinkAccountPage from "./pages/LinkAccountPage";
import ZukanTopPage from "./pages/ZukanTopPage.jsx";
import ZukanListPage from "./pages/ZukanListPage.jsx";
import ZukanSeriesPage from "./pages/ZukanSeriesPage.jsx";
import BattleStartPage from "./pages/BattleStartPage.jsx";
import BattlePlayPage from "./pages/BattlePlayPage.jsx";
import BattleResultPage from "./pages/BattleResultPage.jsx"; // ★ 追加
import AdminDataPage from "./pages/AdminDataPage.jsx";

// 復習まわり
import ReviewQuickStart from "./pages/ReviewQuickStart";
import ReviewListPage from "./pages/ReviewListPage";
import ReviewPlayPage from "./pages/ReviewPlayPage.jsx";
import ReviewSessionStart from "./pages/ReviewSessionStart.jsx";
import ReviewResultPage from "./pages/ReviewResultPage.jsx";

import LoginPage from "./pages/LoginPage.jsx";
import { writeTestBattle } from "./debug/writeTestBattle";

// 図鑑関連
import ZukanDebugCheck from "./pages/ZukanDebugCheck.jsx";
import ZukanRankPage from "./pages/ZukanRankPage.jsx";
import ZukanSpeciesPage from "./pages/ZukanSpeciesPage.jsx";
import DarkLayout from "./layouts/DarkLayout.jsx";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* ログイン */}
        <Route path="/login" element={<LoginPage />} />

        {/* 復習 */}
        <Route path="/review" element={<ReviewQuickStart />} />
        <Route path="/review/start" element={<ReviewSessionStart />} />
        <Route path="/review/result" element={<ReviewResultPage />} />
        <Route path="/review/play/:id" element={<ReviewPlayPage />} />

        {/* 図鑑（全部 DarkLayout で黒背景に統一） */}
        <Route
          path="/zukan"
          element={
            <DarkLayout>
              <ZukanTopPage />
            </DarkLayout>
          }
        />
        <Route
          path="/zukan/list"
          element={
            <DarkLayout>
              <ZukanListPage />
            </DarkLayout>
          }
        />
        <Route
          path="/zukan/:seriesId/:rank"
          element={
            <DarkLayout>
              <ZukanSeriesPage />
            </DarkLayout>
          }
        />
        <Route
          path="/zukan/rank/:rank"
          element={
            <DarkLayout>
              <ZukanRankPage />
            </DarkLayout>
          }
        />
        <Route
          path="/zukan/:rank/:species"
          element={
            <DarkLayout>
              <ZukanSpeciesPage />
            </DarkLayout>
          }
        />
        <Route
          path="/debug/zukan-check"
          element={
            <DarkLayout>
              <ZukanDebugCheck />
            </DarkLayout>
          }
        />

        {/* バトル */}
        <Route path="/battle" element={<BattleStartPage />} />
        <Route path="/battle/play" element={<BattlePlayPage />} />
        <Route path="/battle/result" element={<BattleResultPage />} />

        <Route path="/review-list" element={<ReviewListPage />} />
        <Route path="/review/play" element={<ReviewPlayPage />} />


        {/* 管理・連携 */}
        <Route path="/admin/data" element={<AdminDataPage />} />
        <Route path="/link-account" element={<LinkAccountPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* デバッグセクション（任意） */}
      <div style={{ padding: "1rem" }}>
        <h1>Test Firestore Write</h1>
        <button onClick={writeTestBattle}>Write battles test</button>
        <div style={{ marginTop: 8 }}>
          <Link to="/login">ログイン</Link> /{" "}
          <Link to="/review">復習へ</Link> /{" "}
          <Link to="/review/start">連続復習</Link> /{" "}
          <Link to="/zukan">図鑑トップ</Link> /{" "}
          <Link to="/admin/data">管理</Link>
        </div>
      </div>
    </>
  );
}

function Home() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Home</h2>
      <p>
        <Link to="/battle">バトルへ</Link> /{" "}
        <Link to="/zukan" className="underline text-blue-600">
          図鑑トップ
        </Link>{" "}
        / <Link to="/login">ログイン</Link> /{" "}
        <Link to="/review" className="underline text-blue-600">
          クイック復習
        </Link>{" "}
        /{" "}
        <Link to="/review/start" className="underline text-green-700">
          連続復習
        </Link>{" "}
        / <Link to="/admin/data">管理</Link>
      </p>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ padding: 16 }}>
      <h2>ページが見つかりません</h2>
      <p>
        <Link to="/">ホームへ戻る</Link>
      </p>
    </div>
  );
}
