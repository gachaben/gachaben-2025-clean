// src/pages/ReviewResultPage.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ReviewResultPage() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};
  const total = state?.total ?? 0;
  const correct = state?.correct ?? 0;
  const elapsed = state?.elapsed ?? 0;

  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const sec = Math.max(0, Math.round(elapsed / 1000));

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-bold">復習結果</h2>

      <div className="p-4 border rounded bg-white">
        <div className="text-lg mb-2">
          正答数 <b>{correct}</b> / <b>{total}</b>（{pct}%）
        </div>
        <div className="text-sm text-gray-600">所要時間：{sec} 秒</div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => navigate("/review/start")}
          className="px-4 py-2 rounded bg-emerald-600 text-white"
        >
          もう一度セットを作る
        </button>
        <button
          onClick={() => navigate("/review")}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          一覧へ
        </button>
      </div>
    </div>
  );
}
