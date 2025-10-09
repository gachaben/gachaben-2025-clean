import React, { useState } from "react";
import { useHearts } from "@/context/HeartsContext";
import AdHeartModal from "@/components/AdHeartModal";
import useHeartGate from "@/hooks/useHeartGate";

export default function ChallengePage() {
  const { hearts } = useHearts();
  const [running, setRunning] = useState(false);

  const { startWithHeart, adOpen, closeAd, watchAd, pending } = useHeartGate({
    onProceed: async () => {
      // 難易度セットやタイマー開始など
      setRunning(true);
    },
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">⚡ チャレンジ</h1>
      <div>現在のハート：<b>{hearts}</b></div>
      <button
        disabled={pending}
        onClick={startWithHeart}
        className="px-6 py-3 bg-amber-300 hover:bg-amber-400 rounded-lg font-bold shadow disabled:opacity-60"
      >
        ▶️ スタート（ハート1消費）
      </button>

      {running && <div className="mt-4">チャレンジ中…</div>}

      <AdHeartModal open={adOpen} onClose={closeAd} onWatch={watchAd} />
    </div>
  );
}
