// ------------------------------------------------------
// 🔁 ChallengeRetryPage.jsx（間違い問題だけ再出題）
// ------------------------------------------------------
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { playNote } from "@/lib/useDoremiSound";

export default function ChallengeRetryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const wrongs = location.state?.wrongs || [];

  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showRainbow, setShowRainbow] = useState(false);

  const handleAnswer = (choice) => {
  // 👇 正解判定（例: choice === currentQ.a）
  const current = wrongs[index];
  const isCorrect = choice === current?.a;

  if (isCorrect) {
    // 🎵 正解音（ドレミ）
    ["do", "re", "mi"].forEach((n, i) => {
      setTimeout(() => playNote(n), i * 150);
    });

    if (index + 1 < wrongs.length) {
      setIndex((prev) => prev + 1);
    } else {
      // 🌈 最終問題をクリア
      setFinished(true);
      setShowRainbow(true);

      // 🎶 終了音階を一度だけ再生
      const finishNotes = ["fa", "so", "la", "si", "do2"];
      finishNotes.forEach((n, i) => {
        setTimeout(() => playNote(n), i * 200);
      });

      // 🎯 終了後に結果画面へ
      setTimeout(() => navigate("/challenge/result?cleared=true"), 2000);
    }
  } else {
    // ❌ 不正解音
    ["so", "fa", "re"].forEach((n, i) => {
      setTimeout(() => playNote(n), i * 180);
    });
  }
};


  const currentQ = wrongs[index] || "全問クリア！";

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-sky-100 via-pink-100 to-orange-100">
      {showRainbow && (
        <motion.div
          className="absolute top-0 left-0 w-full h-[60vh] z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{
            background:
              "linear-gradient(120deg, rgba(255,0,0,0.4), rgba(255,165,0,0.4), rgba(0,255,0,0.4), rgba(0,191,255,0.4), rgba(148,0,211,0.4))",
            borderRadius: "50% / 30%",
            filter: "blur(25px)",
          }}
        />
      )}

      <motion.h2
        className="text-3xl font-bold text-pink-600 mb-4 mt-10 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🔁 復習チャレンジ！
      </motion.h2>

      {!finished ? (
        <>
          <p className="text-lg mb-6">{currentQ}</p>
          <motion.button
            onClick={() => handleAnswer("ok")}
            className="bg-pink-400 hover:bg-pink-500 text-white px-8 py-3 rounded-xl text-lg font-bold shadow-lg"
            whileTap={{ scale: 0.9 }}
          >
            答える（OK）
          </motion.button>
        </>
      ) : (
        <motion.div
          className="text-xl font-bold text-pink-600 animate-pulse mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          🌈 復習クリア！虹がかかった！
        </motion.div>
      )}
    </div>
  );
}
