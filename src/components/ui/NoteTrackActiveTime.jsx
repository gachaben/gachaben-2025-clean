// ------------------------------------------------------
// ⌛ src/components/ui/NoteTrackActiveTime.jsx
// 稼働時間ゲージ（吹き出し演出＋ガチャボタン付き）
// ------------------------------------------------------

import React, { useEffect, useRef, useState } from "react";
import NoteFlyRainbow from "@/components/ui/effects/NoteFlyRainbow";

export default function NoteTrackActiveTime({ onFull }) {
  const [progress, setProgress] = useState(0);
  const [waveKey, setWaveKey] = useState(0);
  const [isFull, setIsFull] = useState(false);
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const wasFullRef = useRef(false);

  // 💡 テスト時は3秒ごと（本番は60000）
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => (p >= 105 ? 105 : p + 15));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const filled = Math.min(7, Math.floor(progress / 15));
  const chance = Math.min(100, filled * 15);

  // 🌈 満タン演出
  useEffect(() => {
    const nowFull = filled >= 7;
    if (!wasFullRef.current && nowFull) {
      setWaveKey((k) => k + 1);
      setIsFull(true);
      if (onFull) onFull();
      wasFullRef.current = true;
      const t = setTimeout(() => setIsFull(false), 4000);
      return () => clearTimeout(t);
    }
    if (wasFullRef.current && !nowFull) {
      wasFullRef.current = false;
    }
  }, [filled, onFull]);

  // 💬 メッセージ変更
  const getMessage = (n) => {
    if (n === 0) return "";
    if (n <= 2) return "🎉 きたー！プレミアムアイテムがあたるかも！";
    if (n <= 5) return "✨ チャンス！プレミアムアイテムは目の前だ！";
    if (n === 6) return "🔥 激熱！やったね！";
    if (n >= 7) return "🌈 やったー！おめでとう！";
    return "";
  };

  // 💬 メッセージ表示
  const showMessage = (text) => {
    setMessage(text);
    setVisible(true);
    setTimeout(() => setVisible(false), 3000);
    setTimeout(() => setVisible(true), 4000);
    setTimeout(() => setVisible(false), 7000);
  };

  // 🎲 タップでメッセージ出す
  const handleTap = () => {
    const msg = getMessage(filled);
    if (msg) showMessage(msg);
  };

  // 🎨 音符カラー（だんだん明るく）
  const colors = [
    "#f6c3b8", // サーモンピンク
    "#f8cfa2", // アプリコット
    "#fae29f", // パステルイエロー
    "#d2f4b8", // 若草
    "#a7ebd1", // ミント
    "#a8d8ff", // スカイブルー
    "#d6c4ff", // ラベンダー
  ];

  // 🪄 ガチャボタン状態
  const canGacha = filled > 0;
  const handleGacha = () => {
    alert("📺 動画視聴 → プレミアムガチャへ！");
  };

  return (
    <div
      className={`flex flex-col items-center gap-3 select-none relative ${
        isFull ? "is-full" : ""
      }`}
      onClick={handleTap}
    >
      {/* 🌈 虹音符演出 */}
      {isFull && <NoteFlyRainbow trigger={isFull} />}

      {/* 🎵 音符ゲージ */}
      <div className="relative flex gap-3 p-3 rounded-2xl bg-white/40 backdrop-blur-md overflow-hidden shadow-inner">
        {colors.map((color, i) => {
          const lit = i < filled;
          return (
            <div
              key={`${waveKey}-${i}`}
              className="note relative w-10 h-10 flex justify-center items-center rounded-full border-2 border-white shadow-md text-white font-bold transition-all duration-700 overflow-hidden"
              style={{
                backgroundColor: lit ? color : "#e5e7eb",
                opacity: lit ? 1 : 0.6,
                transform: lit ? "scale(1.1)" : "scale(0.9)",
                boxShadow: lit
                  ? `0 0 12px ${color}, 0 0 28px ${color}77`
                  : "none",
              }}
            >
              <span className="relative z-10 text-2xl">♪</span>
              {isFull && (
                <span
                  key={`${waveKey}-wave-${i}`}
                  className="wave absolute inset-0 rounded-full pointer-events-none"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 💬 吹き出しメッセージ（ふわっと浮上） */}
      {visible && message && (
        <div
          className='absolute -top-16 bg-gradient-to-r from-pink-200 via-yellow-200 to-blue-200 
          text-gray-800 text-sm px-5 py-2 rounded-full shadow-lg border border-white/70 
          font-[Comic_Sans_MS,Poppins,cursive] animate-float'
        >
          {message}
        </div>
      )}

      {/* 🎁 プレミアムガチャボタン */}
      <button
        onClick={handleGacha}
        disabled={!canGacha}
        className={`mt-4 px-6 py-2 rounded-full text-white font-bold text-sm transition-all duration-500 ${
          canGacha
            ? "bg-gradient-to-r from-pink-400 via-yellow-400 to-red-400 shadow-lg hover:scale-105"
            : "bg-gray-400 cursor-not-allowed opacity-70"
        }`}
      >
        🎬 動画を見て、プレミアムガチャをひこう♪
      </button>

      <p className="text-sm mt-2 text-gray-700 font-medium">
        ⏳ 稼働時間：{filled * 5}分（{chance}%）
      </p>

      <style>{`
        .note .wave {
          background: radial-gradient(circle, #fff3b0aa, #ffb4a2aa, #e5989baa);
          opacity: 0;
          animation: none;
        }
        .is-full .note .wave {
          animation: gentleWave 4000ms ease-in-out 1 both;
        }
        @keyframes gentleWave {
          0% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
          100% { opacity: 0; transform: scale(1); }
        }

        /* 💬 吹き出し浮上 */
        @keyframes float {
          0% { transform: translateY(10px); opacity: 0; }
          20% { transform: translateY(0); opacity: 1; }
          80% { transform: translateY(-6px); opacity: 1; }
          100% { transform: translateY(-10px); opacity: 0; }
        }
        .animate-float {
          animation: float 3.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
