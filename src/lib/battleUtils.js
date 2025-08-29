// --- ジャンケン関連ユーティリティ ---

// ランダムに手を返す
export function randomRPS() {
  const hands = ["グー", "チョキ", "パー"];
  const i = Math.floor(Math.random() * hands.length);
  return hands[i];
}

// 勝敗判定
// return: "you" | "cpu" | "draw"
export function judgeRPS(yourHand, cpuHand) {
  if (yourHand === cpuHand) return "draw";

  if (
    (yourHand === "グー" && cpuHand === "チョキ") ||
    (yourHand === "チョキ" && cpuHand === "パー") ||
    (yourHand === "パー" && cpuHand === "グー")
  ) {
    return "you";
  }

  return "cpu";
}
