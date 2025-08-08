// src/pages/BattleResultPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  runTransaction,
  increment,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";

const LS_BATTLE_KEY = "currentBattleId";

const GACHA_TABLE = [
  { reward: 10, weight: 1 },
  { reward: 15, weight: 1 },
  { reward: 30, weight: 1 },
];

function rollGacha(table) {
  const total = table.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * total;
  for (const t of table) {
    if ((r -= t.weight) <= 0) return t.reward;
  }
  return table[table.length - 1].reward;
}

function safeUUID() {
  try {
    // ブラウザに crypto があれば使う
    return crypto.randomUUID();
  } catch {
    // ない環境向けのフォールバック
    return `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

const BattleResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // 受け取り（入口が複数でも落ちないよう広めに）
  const myTotalPw = Number(state?.myTotalPw ?? 0);
  const enemyTotalPw = Number(state?.enemyTotalPw ?? 0);
  const winnerFromState = state?.winner; // "player" | "cpu" | "draw"
  const myCorrect = Number(state?.myCorrect ?? 0);
  const cpuCorrect = Number(state?.cpuCorrect ?? 0);

  // ★ battleId：state優先 → localStorage → それでも無ければ生成して保存（スキップ撲滅）
  const battleId =
    state?.battleId ||
    (typeof localStorage !== "undefined"
      ? localStorage.getItem(LS_BATTLE_KEY)
      : null) ||
    (() => {
      const id = safeUUID();
      try {
        localStorage.setItem(LS_BATTLE_KEY, id);
      } catch {}
      console.warn("battleId missing. generated fallback:", id);
      return id;
    })();

  // 勝敗フォールバック（PW → winner → 正解数）
  const isWinByPw = myTotalPw > enemyTotalPw;
  const isLoseByPw = myTotalPw < enemyTotalPw;
  const isWinByWinner = winnerFromState === "player";
  const isLoseByWinner = winnerFromState === "cpu";
  const isWinByCorrect = myCorrect > cpuCorrect;
  const isLoseByCorrect = cpuCorrect > myCorrect;

  const isWin = isWinByPw || isWinByWinner || isWinByCorrect;
  const isLose = isLoseByPw || isLoseByWinner || isLoseByCorrect;

  // 参加5 + 勝利加算10 = 15
  const baseEarnBpt = useMemo(() => (isWin ? 15 : 5), [isWin]);

  const [gachaUsed, setGachaUsed] = useState(false);
  const [adPlaying, setAdPlaying] = useState(false);
  const [lastGachaReward, setLastGachaReward] = useState(null);

  // 同一マウント内の保険
  const grantedOnceRef = useRef(false);

  // ★ battleId ごとに“一度だけ”付与（原子的）
   useEffect(() => {
    (async () => {
      // ✅ StrictMode 対策：同一 battleId の重複実行を localStorage でもブロック
      const grantKey = `bptGrant:${battleId}`;
      if (grantedOnceRef.current) return;
      if (localStorage.getItem(grantKey) === "done") {
        return;
      }

      const user = auth.currentUser;
      if (!user) return;

      try {
        await runTransaction(db, async (tx) => {
          const userRef = doc(db, "users", user.uid);
          const snap = await tx.get(userRef);
          const data = snap.exists() ? snap.data() : {};

          const granted = Array.isArray(data.grantedBattleIds)
            ? data.grantedBattleIds
            : [];

          if (granted.includes(battleId)) {
            // 二重防止：同じ battleId では付与しない
            return;
          }

          tx.set(
            userRef,
            {
              bpt: increment(baseEarnBpt),
              grantedBattleIds: arrayUnion(battleId),
              lastGrantAt: serverTimestamp(),
            },
            { merge: true }
          );
        });

        grantedOnceRef.current = true;
         // ✅ 二重実行ガード（StrictModeや再マウントでも効く）
          localStorage.setItem(grantKey, "done");

          // 次バトルのために battleId を掃除
        try {
          localStorage.removeItem(LS_BATTLE_KEY);
        } catch {}
        console.log("✅ Bpt base grant done:", { battleId, baseEarnBpt });
      } catch (e) {
       // ✅ たまに dev 環境で出る "already committed" は無視して良い系
        if (String(e?.message || e).includes("already committed")) {

          console.warn("ℹ️ transaction double-fire ignored");
          localStorage.setItem(grantKey, "done");
        } else {
          console.error("❌ grant transaction failed:", e);
        }




      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleId, baseEarnBpt]);

  const handleGacha = async () => {
    if (gachaUsed || adPlaying) return;
    setAdPlaying(true);

    // 擬似広告
    await new Promise((r) => setTimeout(r, 2000));
    const reward = rollGacha(GACHA_TABLE);

    try {
      const user = auth.currentUser;
      if (user) {
        await runTransaction(db, async (tx) => {
          const userRef = doc(db, "users", user.uid);
          tx.set(
            userRef,
            { bpt: increment(reward), lastGachaAt: serverTimestamp() },
            { merge: true }
          );
        });
      }
      setLastGachaReward(reward);
      setGachaUsed(true);
    } catch (e) {
      console.error(e);
    } finally {
      setAdPlaying(false);
    }
  };

  let resultText = "";
  let resultColor = "";
  if (isWin) {
    resultText = "🏆 勝利！";
    resultColor = "text-green-600";
  } else if (isLose) {
    resultText = "💥 敗北…";
    resultColor = "text-red-600";
  } else {
    resultText = "🤝 引き分け";
    resultColor = "text-gray-600";
  }

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-4">
      <h1 className={`text-3xl font-bold mb-4 ${resultColor}`}>{resultText}</h1>

      <div className="bg-white rounded shadow p-4 w-full max-w-sm text-center mb-4">
        <p className="text-lg mb-1">
          あなたの残りPW：<span className="font-bold">{myTotalPw}</span>
        </p>
        <p className="text-lg mb-1">
          相手の残りPW：<span className="font-bold">{enemyTotalPw}</span>
        </p>
        {(state?.myCorrect != null || state?.cpuCorrect != null) && (
          <p className="text-sm text-gray-600">
            正解数：あなた {myCorrect} / 相手 {cpuCorrect}
          </p>
        )}
      </div>

      <div className="bg-white rounded shadow p-4 w-full max-w-sm text-center mb-4">
        <h2 className="font-bold mb-2">🎁 獲得Bpt</h2>
        <p className="text-base mb-1">
          今回の基本付与：
          <span className="font-bold">{baseEarnBpt}</span> Bpt（参加5 + {isWin ? "勝利10" : "勝利0"}）
        </p>

        <div className="mt-3">
          <button
            onClick={handleGacha}
            disabled={gachaUsed || adPlaying}
            className={`px-4 py-2 rounded shadow font-bold ${
              gachaUsed
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : adPlaying
                ? "bg-gray-300 text-gray-700"
                : "bg-pink-500 text-white hover:bg-pink-600"
            }`}
          >
            {adPlaying
              ? "広告視聴中…"
              : gachaUsed
              ? "Bptガチャ 済み"
              : "広告視聴で Bptガチャ（10 / 15 / 30）"}
          </button>

          {lastGachaReward != null && (
            <p className="mt-2 text-sm">
              ガチャ結果：<span className="font-bold">{lastGachaReward}</span> Bpt を追加付与！
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => navigate("/battle/item-select")}
          className="px-4 py-2 bg-blue-500 text-white rounded shadow"
        >
          もう一度戦う
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded shadow"
        >
          ホームへ戻る
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-600">※ ログインしていない場合はBptは加算されません。</p>
    </div>
  );
};

export default BattleResultPage;
