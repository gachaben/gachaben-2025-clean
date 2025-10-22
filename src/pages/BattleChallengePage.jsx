// ------------------------------------------------------
// 🎵 BattleChallengePage.jsx（v4.0：Firebase連携版）
// ✅ createBattle / commitRound / finishBattle 統合
// ✅ バトル券チェック後 → Firestore記録付きバトル開始
// ------------------------------------------------------

import React, { useState, useEffect, useRef } from "react";
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
import RankUpModal from "@/components/ui/RankUpModal";
import { consumeTicket } from "@/utils/useTickets";

import { app } from "@/fbkit/app";
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";

// ✅ Emulator接続（5002）
const functions = getFunctions(app);
connectFunctionsEmulator(functions, "localhost", 5002);

const createBattleFn = httpsCallable(functions, "createBattleFn");
const commitRoundFn = httpsCallable(functions, "commitRoundFn");
const finishBattleFn = httpsCallable(functions, "finishBattleFn");

export default function BattleChallengePage({ user }) {
  const auth = getAuth();
  const navigate = useNavigate();

  const [level, setLevel] = useState(1);
  const [question, setQuestion] = useState(null);
  const [progress, setProgress] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [showRevive, setShowRevive] = useState(false);
  const [showBurst, setShowBurst] = useState(0);
  const [modal, setModal] = useState({ show: false, old: "", new: "" });

  const { cards, useCard, applyEffect, resetCards } = useCardManager();

  const startedRef = useRef(false);
  const [battleId, setBattleId] = useState(null);

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

  // 🎮 入場時：バトル券チェック＋Firebaseバトル作成
  useEffect(() => {
    const startBattle = async () => {
      if (startedRef.current) return;
      startedRef.current = true;

      const ok = await consumeTicket();
      if (!ok) {
        alert("🎫 バトル券が足りません。チャレンジ問題か広告で入手してください。");
        navigate("/");
        return;
      }

      try {
        // ✅ Firebaseでバトル作成
        const res = await createBattleFn({});
        console.log("🎯 createBattle:", res.data);
        setBattleId(res.data.battleId);
        console.log("🎫 バトル券消費完了 → 出題開始");
        fetchQuestion(level);
      } catch (err) {
        console.error("❌ createBattleFn失敗:", err);
        alert("バトル開始時にエラーが発生しました。");
      }
    };
    startBattle();
  }, []);

  // 🎯 回答処理（commitRoundFn 連携）
  const handleAnswer = async (isCorrect, lv) => {
    try {
      if (battleId) {
        await commitRoundFn({
          battleId,
          round: progress + 1,
          result: isCorrect ? "correct" : "wrong",
        });
        console.log(`✅ commitRoundFn: Round ${progress + 1}`, isCorrect);
      }

      if (isCorrect) {
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

  // 🎵 7音達成時 → 結果画面＋finishBattleFn
  useEffect(() => {
    if (progress >= 7 && battleId) {
      const finish = async () => {
        try {
          await finishBattleFn({ battleId });
          console.log("🏁 finishBattleFn 完了:", battleId);
        } catch (err) {
          console.error("❌ finishBattleFn失敗:", err);
        } finally {
          resetCards();
          console.log("🎯 バトルクリア → 結果画面へ遷移します");
          setTimeout(() => {
            navigate(`/battle/result?result=win&score=${progress}`);
          }, 1000);
        }
      };
      finish();
    }
  }, [progress]);

  // 🧩 カード使用
  const handleUseCard = (card) => {
    const effect = applyEffect(card.id, question, 0);
    if (effect.question === null) fetchQuestion(level);
    else setQuestion(effect.question);
    setBonus(effect.bonus || 0);
    useCard(card.id);
  };

  const closeRankModal = () => setModal({ show: false, old: "", new: "" });

  // 🖼️ UI部
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-b from-indigo-50 to-white relative pt-10 pb-[240px]">
      <div
        className="fixed left-0 w-full flex justify-center z-[100000]"
        style={{ bottom: "40px" }}
      >
        <NoteTrackBattle progress={progress} />
      </div>

      {showBurst > 0 && (
        <div className="fixed inset-0 z-[9990] pointer-events-none">
          <NoteBurst count={showBurst} color="#fb7185" />
        </div>
      )}

      {question && !showRevive && (
        <div className="flex flex-col items-center w-full mb-16 mt-10">
          <QuestionPanel
            key={question.id || question.text}
            question={question}
            onAnswer={(isCorrect) => handleAnswer(isCorrect, level)}
          />
        </div>
      )}

      {!showRevive && (
        <div
          className="fixed left-0 w-full flex justify-center z=[9999]"
          style={{ bottom: "160px" }}
        >
          <CardBar cards={cards} onUse={handleUseCard} />
        </div>
      )}

      {showRevive && (
        <ReviveModal
          onRevive={() => setShowRevive(false)} // ❤️ 復活カードで続行
          onClose={() => {
            setShowRevive(false);
            setProgress(0);
            navigate(`/battle/result?result=lose`);
          }}
          hasReviveCard={cards.some((c) => c.id === "revive" && !c.used)}
        />
      )}

      <RankUpModal
        show={modal.show}
        oldRank={modal.old}
        newRank={modal.new}
        onClose={closeRankModal}
      />
    </div>
  );
}
