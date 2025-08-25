// src/hooks/useBattleFinish.js
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { saveBattleRecord } from "../lib/saveBattleRecord";

/**
 * バトル終亁E��の共通�E琁E
 * - 勝敗判宁E
 * - Firestore 保存（征E��なぁE��E
 * - /battle/result へ即遷移
 */
export default function useBattleFinish() {
  const navigate = useNavigate();
  const finishedRef = useRef(false); // 二重実行ガーチE

  const onBattleFinish = ({
    myFinalLeft,
    enemyFinalLeft,
    roundsPlayed,
    selectedItem,
    enemyItem,
    userId = null,
  }) => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    const winner =
      myFinalLeft > enemyFinalLeft ? "you" :
      enemyFinalLeft > myFinalLeft ? "enemy" : "draw";

    // ❶ 保存�E“征E��なぁE��。失敗してもアプリは進む
    saveBattleRecord({
      myLeft: myFinalLeft,
      enemyLeft: enemyFinalLeft,
      roundsPlayed,
      winner,
      userId,
      selectedItem,
      enemyItem,
      endedAt: Date.now(),
    })
      .then((id) => console.log("[battle] saved:", id))
      .catch((e) => console.error("[battle] save failed:", e));

    // ❷ 即遷移�E�保存に依存しなぁE��E
    navigate("/battle/result", {
      state: {
        winner,
        myFinalLeft,
        enemyFinalLeft,
        roundsPlayed,
        selectedItem,
        enemyItem,
      },
      replace: true,
    });
  };

  return { onBattleFinish };
}
