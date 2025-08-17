// src/pages/BattleResultPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db, auth, ensureSignedIn } from "../firebase";

// ====== ここをあなたの環境に合わせて変更 ======
const ZUKAN_PATH = "/zukan/top"; // 例: ZukanTopPage へのパス
// ============================================

// 参加/勝利Bpt
const BPT_BASE = 5;   // 参加ボーナス
const BPT_WIN  = 10;  // 勝利ボーナス

// かわいい吹き出し（マスコット）
function MascotBubble({ children }) {
  return (
    <div className="mt-3 inline-flex items-start gap-2">
      <div className="select-none text-2xl">🪲</div>
      <div className="relative bg-yellow-50 border border-yellow-300 rounded-2xl px-3 py-2 text-sm leading-6 shadow-sm">
        {children}
        <span className="absolute -left-1 top-3 w-3 h-3 bg-yellow-50 border-l border-t border-yellow-300 rotate-45"></span>
      </div>
    </div>
  );
}

export default function BattleResultPage() {
  const navigate = useNavigate();
  const loc = useLocation();

  // BattlePlayPage から state 経由でもらう想定
  // 何も来ていなくても動くようにフォールバック
  const myLeft       = Number(loc.state?.myLeft ?? 0);
  const enemyLeft    = Number(loc.state?.enemyLeft ?? 0);
  const roundsPlayed = Number(loc.state?.roundsPlayed ?? 0);
  const selectedItem = loc.state?.selectedItem ?? { name: "あなた" };
  const enemyItem    = loc.state?.enemyItem ?? { name: "あいて" };
  const battleId     = loc.state?.battleId ?? null;

  const isYouWinner = myLeft > enemyLeft;
  const resultLabel = isYouWinner ? "あなたの勝ち！" : (myLeft < enemyLeft ? "あなたの負け…" : "引き分け");
  const bptEarnThisMatch = isYouWinner ? (BPT_BASE + BPT_WIN) : BPT_BASE;

  // 受け取り状態
  const [bptClaimedTimes, setBptClaimedTimes] = useState(0); // 0:未受取 / 1:通常受取済 / 2:広告分も受取済
  const [claiming, setClaiming] = useState(false);
  const [watchingAd, setWatchingAd] = useState(false);
  const [claimMsg, setClaimMsg] = useState("");

  // （オプション）マスコットの応援メッセージ
  const kidMessage = useMemo(() => {
    if (isYouWinner) {
      return (
        <>
          <div><b>{selectedItem?.name || "あなた"}</b>、やったね！</div>
          <div>きょうは 参加で <b>+{BPT_BASE}</b>、勝ったから さらに <b>+{BPT_WIN}</b>！</div>
          <div>ボタンでBptをもらって、図鑑で どの虫をつよくするか えらんでみよう！</div>
        </>
      );
    }
    return (
      <>
        <div>くやしい…！でもだいじょうぶ！</div>
        <div>参加でも <b>+{BPT_BASE}</b> Bpt もらえるよ。</div>
        <div>あつめて、図鑑で虫を強化してリベンジだ！🔥</div>
      </>
    );
  }, [isYouWinner, selectedItem?.name]);

  useEffect(() => {
    ensureSignedIn().catch((e) => console.error("Anonymous sign-in failed:", e));
  }, []);

  // users/{uid} を保証
  const ensureUserDoc = async (uid) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { bpt: 0, createdAt: serverTimestamp() });
    }
    return ref;
  };

  const grantBpt = async (amount) => {
    if (!amount || amount <= 0) return;
    await ensureSignedIn();
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const ref = await ensureUserDoc(uid);
    await updateDoc(ref, { bpt: increment(amount) });
  };

  // 受け取り1回目
  const handleClaimOnce = async () => {
    if (bptClaimedTimes >= 1 || claiming) return;
    try {
      setClaiming(true);
      await grantBpt(bptEarnThisMatch);
      setBptClaimedTimes(1);
      setClaimMsg(`+${bptEarnThisMatch} Bpt を受け取りました！`);
    } catch (e) {
      console.error(e);
      setClaimMsg("受け取りに失敗しました。通信状況を確認してね。");
    } finally {
      setClaiming(false);
    }
  };

  // 広告→受け取り2回目（ダミーで setTimeout）
  const handleAdAndClaimSecond = async () => {
    if (bptClaimedTimes !== 1 || watchingAd) return;
    setWatchingAd(true);
    setClaimMsg("広告を視聴中…");
    setTimeout(async () => {
      try {
        await grantBpt(bptEarnThisMatch);
        setBptClaimedTimes(2);
        setClaimMsg(`広告ボーナス！さらに +${bptEarnThisMatch} Bpt`);
      } catch (e) {
        console.error(e);
        setClaimMsg("広告ボーナス付与に失敗しました。");
      } finally {
        setWatchingAd(false);
      }
    }, 2500);
  };

  // 図鑑に誘導
  const goZukan = () => {
    navigate(ZUKAN_PATH, { state: { highlightBpt: true } });
  };

  // ====== 後日予定：Bptガチャ（1回のみ / 50%:同額, 50%:2倍） ======
  // 仕様メモ：
  // - 「広告でもう一回ゲット」の後に 1回だけ回せる
  // - 抽選: Math.random() < 0.5 ? bptEarnThisMatch : (bptEarnThisMatch * 2)
  // - 付与後に「本日はガチャ済み」フラグで再実行不可に
  // ここではUIだけ置いておき、後で有効化予定
  const [gachaDoing, setGachaDoing] = useState(false);
  const [gachaResult, setGachaResult] = useState(null);
  const ENABLE_GACHA = false; // ← 後で true にして有効化

  const runGachaOnce = async () => {
    if (!ENABLE_GACHA) return;
    if (bptClaimedTimes !== 2 || gachaDoing || gachaResult != null) return;
    try {
      setGachaDoing(true);
      // 抽選：50% 同額 / 50% 2倍
      const reward = Math.random() < 0.5 ? bptEarnThisMatch : (bptEarnThisMatch * 2);
      await grantBpt(reward);
      setGachaResult(reward);
    } catch (e) {
      console.error(e);
    } finally {
      setGachaDoing(false);
    }
  };

  return (
    <div className="min-h-screen w-full mx-auto max-w-3xl px-4 py-8">
      {/* ヘッダー */}
      <header className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">← 戻る</button>
        <h1 className="text-xl font-bold">バトル結果</h1>
        <div />
      </header>

      {/* 結果カード */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm mb-6">
        <div className="text-lg font-bold mb-1">{resultLabel}</div>
        <div className="text-sm text-gray-600 mb-2">
          ラウンド数: {roundsPlayed} / 最終PW: あなた {myLeft} / 相手 {enemyLeft}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded bg-gray-50 p-3">
            <div className="text-xs text-gray-500 mb-1">あなた</div>
            <div className="font-semibold">{selectedItem?.name ?? "あなた"}</div>
          </div>
          <div className="rounded bg-gray-50 p-3">
            <div className="text-xs text-gray-500 mb-1">相手</div>
            <div className="font-semibold">{enemyItem?.name ?? "あいて"}</div>
          </div>
        </div>

        <MascotBubble>{kidMessage}</MascotBubble>
      </section>

      {/* Bpt 受け取りエリア */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="font-semibold mb-2">Bptゲット！</div>
        <div className="text-sm mb-3">
          参加 <b>+{BPT_BASE}</b>
          {isYouWinner && <> / 勝利ボーナス <b>+{BPT_WIN}</b></>}
          <span className="ml-2">＝ 今回は <b>+{bptEarnThisMatch}</b> Bpt！</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleClaimOnce}
            disabled={bptClaimedTimes >= 1 || claiming}
            className="px-3 py-1.5 rounded bg-emerald-600 text-white disabled:opacity-50"
          >
            {bptClaimedTimes >= 1 ? "受け取り済み" : "Bptを受け取る"}
          </button>

          <button
            onClick={handleAdAndClaimSecond}
            disabled={bptClaimedTimes !== 1 || watchingAd}
            className="px-3 py-1.5 rounded bg-amber-500 text-white disabled:opacity-50"
            title="広告を見たら、もう一度同じBptがもらえるよ"
          >
            {bptClaimedTimes === 2 ? "広告ボーナス受け取り済み" : (watchingAd ? "広告視聴中…" : "広告を見てもう一回ゲット")}
          </button>

          <button
            onClick={goZukan}
            className="ml-auto px-3 py-1.5 rounded bg-indigo-600 text-white"
          >
            図鑑でBptを使う →
          </button>
        </div>

        {claimMsg && <div className="mt-2 text-sm text-gray-700">{claimMsg}</div>}

        {/* 後日有効化：Bptガチャ */}
        <div className="mt-4 pt-3 border-t">
          <div className="text-sm font-semibold mb-1">Bptガチャ（準備中）</div>
          <div className="text-xs text-gray-500 mb-2">
            広告でもう一回ゲットの後に、1回だけ回せる！<br />
            確率：<b>50%</b> で <b>同額</b> / <b>50%</b> で <b>2倍</b>（後で有効化）
          </div>
          <button
            onClick={runGachaOnce}
            disabled={!ENABLE_GACHA || bptClaimedTimes !== 2 || gachaDoing || gachaResult != null}
            className="px-3 py-1.5 rounded bg-pink-600 text-white disabled:opacity-50"
          >
            {ENABLE_GACHA ? (gachaResult ? "ガチャ済み" : (gachaDoing ? "抽選中…" : "Bptガチャを回す")) : "（後で有効化）"}
          </button>
          {gachaResult != null && (
            <div className="mt-2 text-sm">
              結果：<b>+{gachaResult}</b> Bpt を獲得！
            </div>
          )}
        </div>
      </section>

      {/* フッターボタン */}
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        <button onClick={() => navigate(-1)} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">
          バトルへ戻る
        </button>
        <button onClick={() => navigate("/")} className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">
          ホームへ
        </button>
      </div>
    </div>
  );
}
