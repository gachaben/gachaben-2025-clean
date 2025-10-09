// src/pages/ProblemPage.jsx
import React, { useState } from "react";
import { useHearts } from "@/context/HeartsContext";
import AdHeartModal from "@/components/AdHeartModal";
import useHeartGate from "@/hooks/useHeartGate";

export default function ProblemPage() {
  const { hearts } = useHearts();
  const [started, setStarted] = useState(false);

  const { startWithHeart, adOpen, closeAd, watchAd, pending } = useHeartGate({
    onProceed: async () => {
      // ← ここに開始時の初期化処理（問題取得など）
      setStarted(true);
    },
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">📘 学習問題</h1>
      <div>現在のハート：<b>{hearts}</b></div>

      {!started ? (
        <button
          disabled={pending}
          onClick={startWithHeart}
          className="px-6 py-3 bg-blue-300 hover:bg-blue-400 rounded-lg font-bold shadow disabled:opacity-60"
        >
          ▶️ 学習スタート（ハート1消費）
        </button>
      ) : (
        <div className="p-6 rounded-xl bg-white shadow w-[min(90vw,560px)]">
          {/* 本編UI（ダミー） */}
          <p className="mb-4">問題がここに表示されます…</p>
          <button className="px-4 py-2 bg-green-300 rounded-lg">解答する</button>
        </div>
      )}

      <AdHeartModal open={adOpen} onClose={closeAd} onWatch={watchAd} />
    </div>
  );
}
