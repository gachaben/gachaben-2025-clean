// src/hooks/useHeartGate.js
import { useState, useCallback } from "react";
import { useHearts } from "@/context/HeartsContext";

/**
 * アクション開始時にハートを1消費。0なら広告誘導モーダルを開く。
 * - onProceed: ハート消費に成功した時だけ実行される処理
 * 使い方：
 *   const { startWithHeart, adOpen, closeAd, watchAd } = useHeartGate({ onProceed: play });
 *   <button onClick={startWithHeart}>開始</button>
 *   <AdHeartModal open={adOpen} onClose={closeAd} onWatch={watchAd} />
 */
export default function useHeartGate({ onProceed }) {
  const { consumeHeart, recoverHearts } = useHearts();
  const [adOpen, setAdOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const startWithHeart = useCallback(async () => {
    setPending(true);
    try {
      const ok = await consumeHeart();
      if (!ok) {
        setAdOpen(true); // ハート不足 → 広告誘導
        return;
      }
      // 消費成功 → 本処理
      await onProceed?.();
    } finally {
      setPending(false);
    }
  }, [consumeHeart, onProceed]);

  // デモ：広告視聴で全回復（実SDKはここに実装）
  const watchAd = useCallback(async () => {
    await recoverHearts();
    setAdOpen(false);
  }, [recoverHearts]);

  const closeAd = useCallback(() => setAdOpen(false), []);

  return { startWithHeart, adOpen, closeAd, watchAd, pending };
}
