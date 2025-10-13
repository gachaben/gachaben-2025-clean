// ------------------------------------------------------
// 🎴 useCardManager.js（v1.0）
// カード使用・効果処理を統合管理するカスタムフック
// ------------------------------------------------------
import { useState } from "react";

// カードの初期セット
const initialCards = [
  { id: "cut", name: "選択肢カット", used: false },
  { id: "revive", name: "復活カード", used: false },
  { id: "boost", name: "スタートブースト", used: false },
  { id: "time", name: "時間延長", used: false },
  { id: "change", name: "チェンジ", used: false },
];

export default function useCardManager() {
  const [cards, setCards] = useState(initialCards);

  // ✅ カード使用処理
  const useCard = (cardId) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, used: true } : c))
    );
  };

  // ✅ 効果適用ロジック
  const applyEffect = (cardId, question, bonus) => {
    let result = { question, bonus };

    switch (cardId) {
      case "cut": // 🧠 選択肢カット（4択→3択）
        if (question?.choices?.length > 3) {
          const filtered = question.choices.slice(0, 3);
          result.question = { ...question, choices: filtered };
          console.log("🧠 選択肢カット発動");
        }
        break;

      case "revive": // ❤️ 復活カード（ミス時に自動発動予定）
        console.log("❤️ 復活カードは自動扱い（ここでは非発動）");
        break;

      case "boost": // 🌟 スタートブースト（+2pt）
        console.log("🌟 スタートブースト発動 → +2ボーナス");
        result.bonus = 2;
        break;

      case "time": // ⏰ 時間延長（制限時間+5秒）
        console.log("⏰ 時間延長カード発動 → +5秒");
        // → 時間制限ロジック導入時に連動予定
        break;

      case "change": // 🔄 チェンジ（再出題）
        console.log("🔄 チェンジカード発動 → 再出題");
        result.question = null; // nullなら再取得させる
        break;

      default:
        break;
    }

    return result;
  };

  // ✅ 全カードリセット（バトル終了時）
  const resetCards = () => setCards(initialCards);

  return {
    cards,
    useCard,
    applyEffect,
    resetCards,
  };
}
