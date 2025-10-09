// src/pages/ProblemPage.jsx
import React, { useState } from "react";
import { useHearts } from "@/context/HeartsContext";
import AdHeartModal from "@/components/AdHeartModal";

export default function ProblemPage() {
  const { hearts, consumeHeart, recoverHearts } = useHearts();
  const [adOpen, setAdOpen] = useState(false);
  const [started, setStarted] = useState(false);

  const startProblem = async () => {
    // 開始時に1消費
    const ok = await consumeHeart();
    if (!ok) {
      setAdOpen(true);
      return;
    }
    setStarted(true);
  };

  const handleWatchAd = async () => {
    // ここに実SDK連携を入れる。今はデモとして即回復。
    await recoverHearts();
    setAdOpen(false);
    alert("❤️ ハートが全回復しました！");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">📘 学習問題（テンプレ）</h1>
      <div>現在のハート：<b>{hearts}</b></div>

      {!started ? (
        <button
          onClick={startProblem}
          className="px-6 py-3 bg-blue-300 hover:bg-blue-400 rounded-lg font-bold shadow"
        >
          ▶️ 学習スタート（ハート1消費）
        </button>
      ) : (
        <div className="p-6 rounded-xl bg-white shadow">
          <p className="mb-4">問題がここに表示されます…（ダミー）</p>
          <button className="px-4 py-2 bg-green-300 rounded-lg">解答する</button>
        </div>
      )}

      <AdHeartModal
        open={adOpen}
        onWatch={handleWatchAd}
        onClose={() => setAdOpen(false)}
      />
    </div>
  );
}
