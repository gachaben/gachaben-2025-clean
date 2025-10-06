// src/pages/ReviewHomePage.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function ReviewHomePage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">復習モード</h1>

      <p className="text-gray-700">
        過去に間違えた問題をここから復習できます。モードを選んで進んでください。
      </p>

      <div className="grid gap-4">
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-2">QuickStart</h2>
          <p className="text-sm text-gray-600 mb-3">
            サンプル投入や ❤回復など、まず試す用の入り口です。
          </p>
          <Link
            to="/review/quick"
            className="inline-block px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            QuickStartへ
          </Link>
        </div>

        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Mistakes一覧</h2>
          <p className="text-sm text-gray-600 mb-3">
            間違えた問題のリスト。フィルタ・件数切替・「Got/Retry」で管理できます。
          </p>
          <Link
            to="/review/mistakes"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Mistakes一覧へ
          </Link>
        </div>

        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-2">連続復習セッション</h2>
          <p className="text-sm text-gray-600 mb-3">
            科目・単元・出題数を選んで、連続で復習にチャレンジできます。
          </p>
          <Link
            to="/review/session"
            className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            連続復習を開始
          </Link>
        </div>

        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-2">単発復習プレイ</h2>
          <p className="text-sm text-gray-600 mb-3">
            一覧やクイックスタートから選んだ問題をその場で解き直します。
          </p>
          <Link
            to="/review/list"
            className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            単発復習へ
          </Link>
        </div>
      </div>
    </div>
  );
}
