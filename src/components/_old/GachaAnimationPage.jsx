// src/pages/GachaAnimationPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import gachaSound from "../sounds/gacha.mp3";

const GachaAnimationPage = () => {
  const [showCapsule, setShowCapsule] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const audio = new Audio(gachaSound);
    audio.play();

    // 3秒後にアイテム結果ページへ
    const timer = setTimeout(() => {
      setShowCapsule(false);
      navigate("/gacha-result"); // ← アイテム表示ページへ遷移
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-yellow-100 to-blue-100">
      {showCapsule ? (
        <>
          <img
            src="/images/capsule.gif" // ← カプセル画像 or 動くgif
            alt="がちゃがちゃ"
            className="w-40 mb-4 animate-spin-slow"
          />
          <p className="text-lg font-semibold text-gray-600">がちゃがちゃ…</p>
        </>
      ) : (
        <p className="text-lg font-semibold text-gray-500">よみこみちゅう…</p>
      )}
    </div>
  );
};

export default GachaAnimationPage;
