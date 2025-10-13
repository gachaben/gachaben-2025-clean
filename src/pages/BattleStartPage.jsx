// ------------------------------------------------------
// 🎫 BattleStartPage.jsx（v3.0 バトル券正式対応版）
// ------------------------------------------------------
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { consumeOneTicket, fullRecoverTickets } from "../lib/tickets";
import { fullRecoverHearts } from "../lib/hearts";
import HeartFloat from "@/components/HeartFloat"; // 💖回復演出

// クールダウン設定（分単位）
const COOLDOWN_MIN_HEART = 5;
const COOLDOWN_MIN_TICKET = 5;

function makeKey() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// 型ゆらぎに強い ms 変換
function tsToMs(v) {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime?.() ?? 0;
  if (typeof v.toMillis === "function") return v.toMillis();
  if (v.seconds != null && v.nanoseconds != null) {
    return v.seconds * 1000 + Math.floor(v.nanoseconds / 1e6);
  }
  try {
    return v.toDate?.().getTime?.() ?? 0;
  } catch {
    return 0;
  }
}

function formatMMSS(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function BattleStartPage() {
  const navigate = useNavigate();
  const auth = getFirebaseAuth();
  const db = getFirestoreDb();

  const [uid, setUid] = useState(auth.currentUser?.uid ?? null);
  const [user, setUser] = useState(null);
  const [busy, setBusy] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now());
  const [showHeartFloat, setShowHeartFloat] = useState(false); // 💖演出状態

  // 認証購読
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => unsub();
  }, [auth]);

  // User購読
  useEffect(() => {
    if (!uid) {
      setUser(null);
      return;
    }
    const un = onSnapshot(doc(db, "users", uid), (snap) => {
      setUser(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
    return () => un();
  }, [db, uid]);

  // 1秒カウントダウン
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const hearts = user?.hearts ?? 0;
  const tickets = user?.tickets ?? 0; // ✅ battleTickets → tickets に統一

  // ❤ cooldown
  const lastAdHeartsMs = tsToMs(user?.lastAdHeartsAt);
  const cdHeartsTotal = COOLDOWN_MIN_HEART * 60_000;
  const cdHeartsRemain = Math.max(0, cdHeartsTotal - (nowMs - lastAdHeartsMs));
  const canAdRecoverHearts = hearts < 5 && cdHeartsRemain === 0;

  // 🎫 券 cooldown
  const lastAdTicketsMs = tsToMs(user?.lastAdTicketsAt);
  const cdTicketsTotal = COOLDOWN_MIN_TICKET * 60_000;
  const cdTicketsRemain = Math.max(
    0,
    cdTicketsTotal - (nowMs - lastAdTicketsMs)
  );
  const canAdRecoverTickets = tickets < 3 && cdTicketsRemain === 0;

  // ⚔️ バトル開始
  const startBattle = async () => {
    if (!uid) return alert("ログインを確認してください。");
    if (tickets <= 0) {
      alert("バトル券が足りません。チャレンジ問題か広告で入手してください。");
      return;
    }

    try {
      setBusy(true);

      // 🎫 1枚消費
      await consumeOneTicket(uid, "battle:" + makeKey());

      // 将来的に functions の createBattle 呼び出しに変更予定
      navigate("/battle/play");
    } catch (e) {
      console.error("startBattle error:", e);
      if (e?.code === "NO_TICKET") {
        alert("バトル券がありません。チャレンジ問題か広告で入手してください。");
      } else {
        alert("バトル開始に失敗しました。時間をおいて再度お試しください。");
      }
    } finally {
      setBusy(false);
    }
  };

  // 🎥 広告で❤回復
  const doAdRecoverHearts = async () => {
    if (!uid || !canAdRecoverHearts) return;
    try {
      await fullRecoverHearts(uid, { reason: "ad" });
      setShowHeartFloat(true);
      setTimeout(() => setShowHeartFloat(false), 3000);
    } catch (e) {
      console.error("ad recover hearts error:", e);
      alert("回復に失敗しました。時間をおいて再度お試しください。");
    }
  };

  // 🎥 広告で🎫回復
  const doAdRecoverTickets = async () => {
    if (!uid || !canAdRecoverTickets) return;
    try {
      await fullRecoverTickets(uid, { reason: "ad" });
      alert("広告視聴ボーナスで バトル券 が回復しました。");
    } catch (e) {
      console.error("ad recover tickets error:", e);
      alert("回復に失敗しました。時間をおいて再度お試しください。");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 className="text-xl font-bold mb-4">⚔ バトル開始</h2>

      {/* 🎮 バトル開始ボックス */}
      <div className="border border-gray-300 rounded-lg p-3 mb-4">
        <div className="font-semibold mb-2">🎫 バトル券：{tickets} / 3</div>
        <button
          className={`px-4 py-2 rounded border ${
            tickets <= 0 || busy
              ? "opacity-60 cursor-not-allowed"
              : "hover:bg-pink-50"
          }`}
          disabled={tickets <= 0 || busy}
          onClick={startBattle}
        >
          {busy ? "開始中..." : "バトル開始！"}
        </button>
        {tickets <= 0 && (
          <div className="text-sm mt-2 opacity-80">
            バトル券が足りません。下の「広告で回復」から回復できます。
          </div>
        )}
      </div>

      {/* 💖 ハートパネル */}
      <div className="border border-dashed border-pink-300 rounded-lg p-3 mb-4 bg-pink-50/40">
        <div className="font-semibold mb-2">💖 スタミナ：{hearts} / 5</div>
        <button
          className={`px-3 py-2 rounded border ${
            !canAdRecoverHearts
              ? "opacity-60 cursor-not-allowed"
              : "hover:bg-pink-100"
          }`}
          disabled={!canAdRecoverHearts}
          onClick={doAdRecoverHearts}
        >
          {canAdRecoverHearts
            ? "🎥 広告で ❤ 全回復（今すぐ！）"
            : `❤ 回復まで ${COOLDOWN_MIN_HEART}分`}
        </button>
        <div className="text-xs mt-1 opacity-70">
          {hearts >= 5
            ? "❤は満タンです。"
            : cdHeartsRemain > 0
            ? `再使用まで ${formatMMSS(cdHeartsRemain)}`
            : "今すぐ使用できます。"}
        </div>
      </div>

      {/* 🎫 バトル券パネル */}
      <div className="border border-dashed border-blue-300 rounded-lg p-3 mb-4 bg-blue-50/40">
        <div className="font-semibold mb-2">🎫 バトル券：{tickets} / 3</div>
        <button
          className={`px-3 py-2 rounded border ${
            !canAdRecoverTickets
              ? "opacity-60 cursor-not-allowed"
              : "hover:bg-blue-100"
          }`}
          disabled={!canAdRecoverTickets}
          onClick={doAdRecoverTickets}
        >
          {canAdRecoverTickets
            ? "🎥 広告で バトル券 全回復（今すぐ！）"
            : `券 回復まで ${COOLDOWN_MIN_TICKET}分`}
        </button>
        <div className="text-xs mt-1 opacity-70">
          {tickets >= 3
            ? "バトル券は満タンです。"
            : cdTicketsRemain > 0
            ? `再使用まで ${formatMMSS(cdTicketsRemain)}`
            : "今すぐ使用できます。"}
        </div>
      </div>

      <div className="text-center mt-4">
        <Link to="/" className="text-sm text-blue-500 underline">
          ホームへ戻る
        </Link>
      </div>

      {/* 💖 回復演出 */}
      <HeartFloat show={showHeartFloat} />
    </div>
  );
}
