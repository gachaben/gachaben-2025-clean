// ------------------------------------------------------
// 🎵 BattleChallengePage.jsx（v2.3）
// ドレミゲージ点灯修正版＋Z階層調整
// ------------------------------------------------------
import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/fbkit";

import QuestionPanel from "@/components/battle/QuestionPanel";
import CardBar from "@/components/battle/CardBar";
import ReviveModal from "@/components/battle/ReviveModal";
import ResultModal from "@/components/battle/ResultModal";
import NoteBurst from "@/components/ui/NoteBurst";
import NoteTrackBattle from "@/components/ui/NoteTrackBattle";
import useCardManager from "@/hooks/useCardManager";
import { updateDoremiPoints } from "@/utils/updateDoremiPoints";

export default function BattleChallengePage({ user }) {
  const [level, setLevel] = useState(1);
  const [question, setQuestion] = useState(null);
  const [progress, setProgress] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showRevive, setShowRevive] = useState(false);
  const [showBurst, setShowBurst] = useState(0);

  const { cards, useCard, applyEffect, resetCards } = useCardManager();

  // 🧠 Firestore 出題
  const fetchQuestion = async (lv) => {
    try {
      const q = query(
        collection(db, "problems"),
        where("grade", "<=", user?.grade || 3),
        where("level", "==", lv)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const random = docs[Math.floor(Math.random() * docs.length)];
        const text = random.text || random.body?.q || "問題が見つかりません";
        const choices = random.choices || ["6", "8", "9", "12"];
        const answer = random.answer || random.body?.a || "12";
        setQuestion({ id: random.id, text, choices, answer });
      } else {
        setQuestion({
          text: "3×4は？",
          choices: ["6", "8", "9", "12"],
          answer: "12",
        });
      }
    } catch (e) {
      console.error("❌ fetchQuestion失敗:", e);
      setQuestion({
        text: "3×4は？",
        choices: ["6", "8", "9", "12"],
        answer: "12",
      });
    }
  };

  // 🎯 回答処理
  const handleAnswer = async (isCorrect, lv) => {
    if (isCorrect) {
      // Firestore: 勝利時 +10 DP
      await updateDoremiPoints(user?.uid, 10);

      const add = (lv === 1 ? 1 : lv === 2 ? 2 : 3) + bonus;
      setBonus(0);
      setProgress((p) => Math.min(p + add, 7)); // ✅ progress ちゃんと増える
      setShowBurst(add);
      setTimeout(() => setShowBurst(0), 2000);
      setQuestion(null);
      setTimeout(() => fetchQuestion(lv), 800);
    } else {
      setShowRevive(true);
    }
  };

  useEffect(() => {
    fetchQuestion(level);
  }, []);

  useEffect(() => {
    console.log("progress 値:", progress); // ← ✅ 正しい位置に
    if (progress >= 7) {
      setShowResult(true);
      resetCards();
    }
  }, [progress]);

  const handleUseCard = (card) => {
    const effect = applyEffect(card.id, question, 0);
    if (effect.question === null) fetchQuestion(level);
    else setQuestion(effect.question);
    setBonus(effect.bonus || 0);
    useCard(card.id);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-b from-indigo-50 to-white relative pt-10 pb-[240px]">
      {/* ♬ ドレミゲージ（最下部） ← 先に描画して最前面化 */}
      <div
        className="fixed left-0 w-full flex justify-center z-[100000]"
        style={{ bottom: "40px" }}
      >
        <NoteTrackBattle progress={progress} />
      </div>

      {/* ♬ 飛ぶ音符（少し下げる） */}
      {showBurst > 0 && (
        <div className="fixed inset-0 z-[9990] pointer-events-none">
          <NoteBurst count={showBurst} color="#fb7185" />
        </div>
      )}

      {/* 問題パネル */}
      {question && !showResult && !showRevive && (
        <div className="flex flex-col items-center w-full mb-16 mt-10">
          <QuestionPanel
            key={question.id || question.text}
            question={question}
            onAnswer={(isCorrect) => handleAnswer(isCorrect, level)}
          />
        </div>
      )}

      {/* 🎴 カードバー */}
      {!showResult && !showRevive && (
        <div
          className="fixed left-0 w-full flex justify-center z-[9999]"
          style={{ bottom: "160px" }}
        >
          <CardBar cards={cards} onUse={handleUseCard} />
        </div>
      )}

      {/* ==== モーダル ==== */}
      {showRevive && (
        <ReviveModal
          onRevive={() => setShowRevive(false)}
          onClose={() => {
            setShowRevive(false);
            setProgress(0);
          }}
          hasReviveCard={cards.some((c) => c.id === "revive" && !c.used)}
        />
      )}

      {showResult && (
        <ResultModal
          onClose={() => {
            setLevel(1);
            setProgress(0);
            setShowResult(false);
            setQuestion(null);
            fetchQuestion(1);
          }}
        />
      )}
    </div>
  );
}
