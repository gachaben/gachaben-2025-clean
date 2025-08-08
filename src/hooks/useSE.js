// src/hooks/useSE.js
import { useCallback, useEffect, useRef, useState } from "react";

const makeAudio = (src, volume = 0.6) => {
  const a = new Audio(src);
  a.preload = "auto";
  a.volume = volume;
  return a;
};

/**
 * 効果音フック
 * - click: ボタン押下など小さめSE
 * - victory: 勝利ファンファーレ
 * iOSの自動再生ブロックにも一応対応（失敗したら次のタップで再試行）
 */
export default function useSE({
  clickSrc = "/se/click.mp3",
  victorySrc = "/se/victory.mp3",
  volume = 0.7,
} = {}) {
  const clickRef = useRef(null);
  const victoryRef = useRef(null);
  const [needsUserGesture, setNeedsUserGesture] = useState(false);

  useEffect(() => {
    clickRef.current = makeAudio(clickSrc, Math.min(volume, 0.5));
    victoryRef.current = makeAudio(victorySrc, volume);
    // モバイルでの遅延初期化対策：ユーザーの最初のタップで解放
    const unlock = () => {
      try {
        clickRef.current?.play().then(() => {
          clickRef.current?.pause();
          clickRef.current.currentTime = 0;
        });
        victoryRef.current?.play().then(() => {
          victoryRef.current?.pause();
          victoryRef.current.currentTime = 0;
        });
        setNeedsUserGesture(false);
      } catch {
        setNeedsUserGesture(true);
      }
      window.removeEventListener("pointerdown", unlock, { capture: true });
    };
    window.addEventListener("pointerdown", unlock, { capture: true, once: true });
    return () => window.removeEventListener("pointerdown", unlock, { capture: true });
  }, [clickSrc, victorySrc, volume]);

  const playClick = useCallback(() => {
    const a = clickRef.current;
    if (!a) return;
    try {
      a.currentTime = 0;
      a.play();
    } catch {
      // 無音でもOK
    }
  }, []);

  const playVictory = useCallback(() => {
    const a = victoryRef.current;
    if (!a) return;
    try {
      a.currentTime = 0;
      const p = a.play();
      if (p?.catch) p.catch(() => setNeedsUserGesture(true));
    } catch {
      setNeedsUserGesture(true);
    }
  }, []);

  return { playClick, playVictory, needsUserGesture };
}
