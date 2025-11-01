// ------------------------------------------------------
// 📘 LessonPage.jsx（教科書学習モード / 匿名ログイン＋ドレミ音対応・クリック完全修正版）
// ------------------------------------------------------
import React, { useState, useEffect } from "react";
import NoteProgress from "@/components/ui/NoteProgress";
import { playNote, playFullScale } from "@/lib/useDoremiSound";
import { motion } from "framer-motion";
import { saveUserStreak } from "@/lib/firestoreStreak";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// ✅ 連続正解バナー
function CorrectStreakBanner({ streak }) {
  if (!streak || streak === 0) return null;
  const getStyle = () => {
    if (streak < 3) return "bg-sky-200 text-sky-800";
    if (streak < 5) return "bg-yellow-200 text-yellow-800";
    return "bg-pink-200 text-pink-800";
  };
  return (
    <motion.div
      className={`fixed top-0 left-0 w-full py-2 text-center font-bold text-lg ${getStyle()} shadow-md z-50`}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      🎵 {streak}問連続正解中！
    </motion.div>
  );
}

// ------------------------------------------------------
// 📘 LessonPage 本体
// ------------------------------------------------------
export default function LessonPage() {
  const [authReady, setAuthReady] = useState(false);
  const [current, setCurrent] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isRainbow, setIsRainbow] = useState(false);
  const auth = getAuth();

  // ✅ AudioContext 有効化（LessonPage 初回クリックで再生許可）
  useEffect(() => {
    const resumeAudio = () => {
      if (window.AudioContext || window.webkitAudioContext) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === "suspended") {
          ctx.resume().then(() => console.log("🔊 AudioContext resumed (LessonPage)"));
        }
      }
    };
    document.addEventListener("click", resumeAudio);
    return () => document.removeEventListener("click", resumeAudio);
  }, []);

  // ✅ 匿名ログイン
  useEffect(() => {
    const runAuth = async () => {
      try {
        const result = await signInAnonymously(auth);
        console.log("🟢 Anonymous login success:", result.user.uid);
        setAuthReady(true);
      } catch (err) {
        console.error("❌ Anonymous login failed:", err);
      }
    };

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ onAuthStateChanged user detected:", user.uid);
        setAuthReady(true);
      } else {
        runAuth();
      }
    });

    return () => unsub();
  }, [auth]);

  // ✅ 出題リスト
  const questions = [
    { q: "ミの前は？", a: "レ" },
    { q: "ドの次は？", a: "レ" },
    { q: "ファの次は？", a: "ソ" },
  ];

  // ✅ 回答処理
  const handleAnswer = async (isCorrect) => {
    console.log("🎯 handleAnswer 実行されました (isCorrect):", isCorrect);

    if (isCorrect) {
      const next = current + 1;
      setCurrent(next);
      setStreak((prev) => prev + 1);

      const noteOrder = ["do", "re", "mi", "fa", "so", "la", "si", "do2"];
      playNote(noteOrder[next - 1] || "do");

      if (authReady) await saveUserStreak(true);

      if (next >= 8) {
        setTimeout(() => {
          playFullScale();
          setIsRainbow(true);
        }, 600);
      }
    } else {
      setStreak(0);
      if (authReady) await saveUserStreak(false);
    }

    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      console.log("✅ 小単元クリア！");
    }
  };

  // ✅ Firebase 接続待ち表示
  if (!authReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-lg text-gray-500 bg-gradient-to-b from-blue-100 to-sky-200">
        🔄 Firebase 認証接続中...
      </div>
    );
  }

  const currentQ = questions[questionIndex];

  // ✅ 画面描画
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-sky-200 relative"
      style={{ pointerEvents: "auto", zIndex: 9999 }}
    >
      <CorrectStreakBanner streak={streak} />
      <h2 className="text-2xl font-bold mb-4 mt-10">📘 小単元モード</h2>
      <p className="text-lg mb-4">{`第 ${questionIndex + 1} 問`}</p>

      {/* ✅ 白背景ボックス（クリックを透過させる） */}
      <div
        className="bg-white rounded-2xl shadow-lg px-8 py-6 mb-6 text-center"
        style={{ pointerEvents: "none", zIndex: 0 }}
      >
        <p className="text-xl font-semibold mb-4">{currentQ.q}</p>

        {/* === 問題選択肢 === */}
        <div
          className="flex gap-4 justify-center"
          style={{ pointerEvents: "auto", zIndex: 10 }}
        >
          {["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ"].map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                console.log("🟢 ボタン押下:", opt);
                handleAnswer(opt === currentQ.a);
              }}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-xl text-lg font-bold transition shadow-md"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <NoteProgress current={current} isRainbow={isRainbow} />

      {isRainbow && (
        <motion.p
          className="text-xl font-bold text-pink-600 animate-pulse mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          🌈 小単元クリア！ドレミが響いた！
        </motion.p>
      )}
    </div>
  );
}
