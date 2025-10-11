// ------------------------------------------------------
// 🧠 src/hooks/useCardManager.js
// ドレミチャレンジバトル：カード効果管理フック
// ------------------------------------------------------
import { useState } from "react";

// 初期カードセット（バトル開始時に配布）
const DEFAULT_CARDS = [
  { id: "cut", name: "🧠 選択肢カット", desc: "選択肢を1つ消す", used: false },
  { id: "time", name: "⏰ 時間延長", desc: "制限時間+5秒", used: false },
  { id: "change", name: "🔄 チェンジ", desc: "出題を変更", used: false },
  { id: "boost", name: "🌟 ブースト", desc: "次の正解ポイント+1", used: false },
];

export default function useCardManager() {
  const [cards, setCards] = useState(DEFAULT_CARDS);

  // ✅ カード使用処理
  const useCard = (cardId) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.used) return null;

    // 使用状態に更新
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, used: true } : c))
    );

    return card;
  };

  // ✅ 効果適用処理
  const applyEffect = (cardId, question, timer) => {
    let modified = { question, timer, bonus: 0 };

    switch (cardId) {
      case "cut":
        // 選択肢を1つランダム削除
        if (question.choices.length > 2) {
          const idx = Math.floor(Math.random() * question.choices.length);
          const newChoices = question.choices.filter(
            (_, i) => i !== idx && question.choices[i] !== question.answer
          );
          modified.question = { ...question, choices: newChoices };
        }
        break;

      case "time":
        // 制限時間延長（+5秒）
        modified.timer = (timer || 0) + 5;
        break;

      case "change":
        // 出題変更（親が再取得する想定）
        modified.question = null;
        break;

      case "boost":
        // 次の正解時のポイント +1 ボーナス
        modified.bonus = 1;
        break;

      default:
        break;
    }

    return modified;
  };

  // ✅ リセット処理
  const resetCards = () => {
    setCards(DEFAULT_CARDS.map((c) => ({ ...c, used: false })));
  };

  return {
    cards,
    useCard,
    applyEffect,
    resetCards,
  };
}
