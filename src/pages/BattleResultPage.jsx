// src/pages/BattleResultPage.jsx
import React, { useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  doc,
  runTransaction,
  getDoc,
  setDoc,
  increment,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const LS_BATTLE_KEY = "currentBattleId";

export default function BattleResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // 可能な限り広く受け取り & フォールバック
  const myTotalPw = Number(state?.myTotalPw ?? 0);
  const enemyTotalPw = Number(state?.enemyTotalPw ?? 0);
  const myCorrect = Number(state?.myCorrect ?? 0);
  const cpuCorrect = Number(state?.cpuCorrect ?? 0);
  const winnerFromState = state?.winner; // "player" | "cpu" | "draw" など

  // battleId: state 優先 → localStorage
  const battleId = useMemo(
    () => state?.battleId || localStorage.getItem(LS_BATTLE_KEY) || null,
    [state?.battleId]
  );

  // 勝敗フォールバック（PW → winner → 正解数）
  const isWin =
    (myTotalPw > enemyTotalPw) ||
    (winnerFromState === "player") ||
    (myCorrect > cpuCorrect);

  // baseEarnBpt: state を優先、無ければ勝敗から決定（敗戦=5, 勝利=15）
  const baseEarnBpt = Number(
    state?.baseEarnBpt != null ? state.baseEarnBpt : (isWin ? 15 : 5)
  );

  // ===== ここから付与処理（Tx + フォールバック、二重実行ロック付き） =====
  const grantingRef = useRef(false);

  useEffect(() => {
    (async () => {
      if (grantingRef.current) return;

      if (!battleId) {
        console.warn("battleId not found; base Bpt grant skipped");
        return;
      }
      const user = auth.currentUser;
      if (!user) return;

      // 同タブ内の二重実行ロック（StrictMode対策）
      const lockKey = `granting:${battleId}`;
      if (sessionStorage.getItem(lockKey)) return;
      sessionStorage.setItem(lockKey, "1");
      grantingRef.current = true;

      const userRef = doc(db, "users", user.uid);

      // 0) 事前確認：既にこの battleId で付与済みなら抜ける
      try {
        const pre = await getDoc(userRef);
        if (pre.exists()) {
          const d = pre.data() || {};
          if (Array.isArray(d.grantedBattleIds) && d.grantedBattleIds.includes(battleId)) {
            console.log("already granted for this battleId, skip:", battleId);
            return;
          }
        }
      } catch {}

      // 1) まずは Tx で安全に付与
      try {
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(userRef);
          const exists = snap.exists();
          const data = exists ? snap.data() : {};
          const granted = Array.isArray(data.grantedBattleIds) ? data.grantedBattleIds : [];

          if (granted.includes(battleId)) return;

          if (!exists) {
            // 新規ユーザー doc 作成（transformを使わない）
            tx.set(userRef, {
              bpt: (data.bpt || 0) + baseEarnBpt,
              grantedBattleIds: [battleId],
              lastGrantAt: serverTimestamp(),
              // あるなら初期値も維持
              pw: data.pw || 0,
              cpt: data.cpt || 0,
            });
          } else {
            // 既存 doc に加算
            tx.set(
              userRef,
              {
                bpt: increment(baseEarnBpt),
                grantedBattleIds: arrayUnion(battleId),
                lastGrantAt: serverTimestamp(),
              },
              { merge: true }
            );
          }
        });

        console.log("Bpt base grant (txn) done:", { battleId, baseEarnBpt });
        try { localStorage.removeItem(LS_BATTLE_KEY); } catch {}
        return; // Tx 成功 → 終了
      } catch (e) {
        console.warn("txn failed, fallback to setDoc path:", e?.code || e?.message);
      }

      // 2) フォールバック：get→setDoc(merge) で手動加算（必ず通す）
      try {
        const snap2 = await getDoc(userRef);
        const data2 = snap2.exists() ? (snap2.data() || {}) : {};
        const has = Array.isArray(data2.grantedBattleIds) && data2.grantedBattleIds.includes(battleId);
        if (has) {
          console.log("already granted (fallback precheck), skip:", battleId);
          return;
        }

        const nextBpt = (data2.bpt || 0) + baseEarnBpt;
        const nextGranted = Array.isArray(data2.grantedBattleIds)
          ? [...data2.grantedBattleIds, battleId]
          : [battleId];

        await setDoc(
          userRef,
          {
            bpt: nextBpt,
            grantedBattleIds: nextGranted,
            lastGrantAt: serverTimestamp(),
            pw: data2.pw || 0,
            cpt: data2.cpt || 0,
          },
          { merge: true }
        );

        console.log("Bpt base grant (fallback) done:", { battleId, baseEarnBpt, nextBpt });
        try { localStorage.removeItem(LS_BATTLE_KEY); } catch {}
      } catch (e2) {
        console.error("fallback grant failed:", e2);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleId, baseEarnBpt]);

  // ===== 表示（シンプルでOK：本番UIは後で戻す） =====
  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <h1 className={`text-2xl font-bold mb-4 ${isWin ? "text-green-600" : "text-red-600"}`}>
        {isWin ? "🏆 勝利！" : "💥 敗北…"}
      </h1>

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
          今回の基本付与：<span className="font-bold">{baseEarnBpt}</span> Bpt（参加5 + {isWin ? "勝利10" : "勝利0"}）
        </p>
        {!battleId && (
          <p className="text-xs text-red-600 mt-1">
            ※ battleId が渡っていないため、基本付与はスキップされました
          </p>
        )}
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
}
