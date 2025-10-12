// ------------------------------------------------------
// 🎵 BattleChallengePage.jsx（v2.8）
// 各正解ごとに +10pt 加算 → ランク変化時は即モーダル表示
// ------------------------------------------------------
import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "@/fbkit";

import QuestionPanel from "@/components/battle/QuestionPanel";
import CardBar from "@/components/battle/CardBar";
import ReviveModal from "@/components/battle/ReviveModal";
import NoteBurst from "@/components/ui/NoteBurst";
import NoteTrackBattle from "@/components/ui/NoteTrackBattle";
import useCardManager from "@/hooks/useCardManager";
import { updateDoremiPoints } from "@/utils/updateDoremiPoints";
import RankUpModal from "@/components/ui/RankUpModal";

export default function BattleChallengePage({ user }) {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  const [level, setLevel] = useState(1);
  const [question, setQuestion] = useState(null);
  const [progress, setProgress] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [showRevive, setShowRevive] = useState(false);
  const [showBurst, setShowBurst] = useState(0);

  // 🎹 ランクアップモーダル
  const [modal, setModal] = useState({ show: false, old: "", new: "" });

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
        setQuestion({
          id: random.id,
          text: random.text || random.body?.q || "問題が見つかりません",
          choices: random.choices || ["6", "8", "9", "12"],
          answer: random.answer || random.body?.a || "12",
        });
      } else {
        setQuestion({
          text: "3×4は？",
          choices: ["6", "8", "9", "12"],
          answer: "12",
        });
      }
    } catch (e) {
      console.error("❌ fetchQuestion失敗:", e);
    }
  };

  // 🎯 回答処理
  const handleAnswer = async (isCorrect, lv) => {
    try {
      if (isCorrect) {
        const user = auth.currentUser;
        if (user) {
          const updated = await updateDoremiPoints(user.uid, 10);
          console.log("✅ 1問ごとDP加算 (+10pt)");

          // 🎹 ランクアップ検知（即表示）
          if (updated && updated.rank !== updated.prevRank) {
            console.log("🎶 RankUpModal即発火:", updated.prevRank, "→", updated.rank);
            setModal({ show: true, old: updated.prevRank, new: updated.rank });
          }
        }

        const add = (lv === 1 ? 1 : lv === 2 ? 2 : 3) + bonus;
        setBonus(0);
        setProgress((p) => Math.min(p + add, 7));
        setShowBurst(add);
        setTimeout(() => setShowBurst(0), 1200);
        setQuestion(null);
        setTimeout(() => fetchQuestion(lv), 800);
      } else {
        setShowRevive(true);
      }
    } catch (e) {
      console.error("❌ handleAnswer失敗:", e);
    }
  };

  useEffect(() => {
    fetchQuestion(level);
  }, []);

  // 🎵 7音達成時（クリアで結果画面へ遷移）
  useEffect(() => {
    if (progress >= 7) {
      resetCards();
      console.log("🎯 バトルクリア → 結果画面へ遷移します");
      setTimeout(() => {
        navigate(`/battle/result?result=win&score=${progress}`);
      }, 1000);
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
      {/* ♬ ドレミゲージ */}
      <div
        className="fixed left-0 w-full flex justify-center z-[100000]"
        style={{ bottom: "40px" }}
      >
        <NoteTrackBattle progress={progress} />
      </div>

      {/* ♬ 飛ぶ音符 */}
      {showBurst > 0 && (
        <div className="fixed inset-0 z-[9990] pointer-events-none">
          <NoteBurst count={showBurst} color="#fb7185" />
        </div>
      )}

      {/* 問題 */}
      {question && !showRevive && (
        <div className="flex flex-col items-center w-full mb-16 mt-10">
          <QuestionPanel
            key={question.id || question.text}
            question={question}
            onAnswer={(isCorrect) => handleAnswer(isCorrect, level)}
          />
        </div>
      )}

      {/* カードバー */}
      {!showRevive && (
        <div
          className="fixed left-0 w-full flex justify-center z-[9999]"
          style={{ bottom: "160px" }}
        >
          <CardBar cards={cards} onUse={handleUseCard} />
        </div>
      )}

      {/* モーダル */}
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

      {/* 🎹 ランクアップ表示 */}
      <RankUpModal
        show={modal.show}
        oldRank={modal.old}
        newRank={modal.new}
        onClose={() => setModal({ show: false, old: "", new: "" })}
      />
    </div>
  );
}
