// src/pages/BannedPage.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function BannedPage() {
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-xl font-bold text-red-600">利用が制限されています</h1>
      <p className="text-sm text-neutral-700">
        このアカウントは現在、利用停止（banned）状態です。心当たりがない場合は、運営にお問い合わせください。
      </p>
      <Link to="/" className="text-blue-600 hover:underline text-sm">
        ← ホームへ戻る
      </Link>
    </div>
  );
}
