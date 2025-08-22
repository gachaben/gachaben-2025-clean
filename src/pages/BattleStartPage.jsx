// src/pages/BattleStartPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../legacy_deprecated/firebase";
import { consumeOneTicket, fullRecoverTickets } from "../lib/tickets";
import { fullRecoverHearts } from "../lib/hearts";

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
  const uid = getAuth().currentUser?.uid;

  const [user, setUser] = useState(null);
  const [busy, setBusy] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now()); // ← 毎秒更新してカウントダウン

  // User 購読
  useEffect(() => {
    if (!uid) return;
    const un = onSnapshot(doc(db, "users", uid), (snap) => {
      setUser(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
    return () => un && un();
  }, [uid]);

  // 1秒タイマー
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const hearts = user?.hearts ?? 0;
  const tickets = user?.battleTickets ?? 0;

  // ❤ cooldown
  const lastAdHeartsMs = tsToMs(user?.lastAdHeartsAt);
  const cdHeartsTotal = COOLDOWN_MIN_HEART * 60_000;
  const cdHeartsRemain = Math.max(0, cdHeartsTotal - (nowMs - lastAdHeartsMs));
  const canAdRecoverHearts = hearts < 5 && cdHeartsRemain === 0;

  // 券 cooldown
  const lastAdTicketsMs = tsToMs(user?.lastAdTicketsAt);
  const cdTicketsTotal = COOLDOWN_MIN_TICKET * 60_000;
  const cdTicketsRemain = Math.max(0, cdTicketsTotal - (nowMs - lastAdTicketsMs));
  const canAdRecoverTickets = tickets < 3 && cdTicketsRemain === 0;

  // バトル開始（券を1枚消費）
  const startBattle = async () => {
    if (!uid) return alert("ログインを確認してください");
    if (tickets <= 0) {
      alert("バトル券が足りません。回復してから再挑戦してね！");
      return;
    }
    try {
      setBusy(true);
      await consumeOneTicket(uid, "battle:" + makeKey());
      navigate("/battle/play");
    } catch (e) {
      console.error("startBattle error:", e);
      if (e?.code === "NO_TICKET") {
        alert("バトル券が0です。回復してから再挑戦してね！");
      } else {
        alert("バトル開始に失敗しました。時間をおいて再度お試しください。");
      }
    } finally {
      setBusy(false);
    }
  };

  // 広告回復（❤／券）
  const doAdRecoverHearts = async () => {
    if (!uid) return;
    if (!canAdRecoverHearts) return;
    try {
      await fullRecoverHearts(uid, { reason: "ad" });
      alert("広告視聴ボーナス：❤が全回復しました！");
    } catch (e) {
      console.error("ad recover hearts error:", e);
      alert("回復に失敗しました。時間をおいて再度お試しください。");
    }
  };
  const doAdRecoverTickets = async () => {
    if (!uid) return;
    if (!canAdRecoverTickets) return;
    try {
      await fullRecoverTickets(uid, { reason: "ad" });
      alert("広告視聴ボーナス：バトル券が全回復しました！");
    } catch (e) {
      console.error("ad recover tickets error:", e);
      alert("回復に失敗しました。時間をおいて再度お試しください。");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>バトル開始</h2>

      {/* バトル開始ブロック */}
      <div style={{ margin: "12px 0", padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>
          バトル券：{tickets} / 3
        </div>
        <button
          className={`px-4 py-2 rounded border ${tickets <= 0 || busy ? "opacity-60 cursor-not-allowed" : ""}`}
          disabled={tickets <= 0 || busy}
          onClick={startBattle}
        >
          {busy ? "開始中..." : "バトル開始"}
        </button>
        {tickets <= 0 && (
          <div style={{ marginTop: 8, fontSize: 12 }}>
            バトル券が足りません。下の「広告で回復」か、<Link to="/review">/review</Link> から回復できます。
          </div>
        )}
      </div>

      {/* ❤パネル */}
      <div style={{ padding: 12, border: "1px dashed #bbb", borderRadius: 8, margin: "12px 0", background: "#fafafa" }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>❤スタミナ：{hearts} / 5</div>
        <button
          className={`px-3 py-2 rounded border ${!canAdRecoverHearts ? "opacity-60 cursor-not-allowed" : ""}`}
          disabled={!canAdRecoverHearts}
          onClick={doAdRecoverHearts}
        >
          {canAdRecoverHearts ? "広告で❤全回復（今すぐ）" : `広告で❤全回復（${COOLDOWN_MIN_HEART}分クールダウン）`}
        </button>
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
          {hearts >= 5 ? "❤は満タンです。" : cdHeartsRemain > 0 ? `再使用まで ${formatMMSS(cdHeartsRemain)}` : "今すぐ使用できます。"}
        </div>
      </div>

      {/* バトル券パネル */}
      <div style={{ padding: 12, border: "1px dashed #bbb", borderRadius: 8, margin: "12px 0", background: "#fafafa" }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>バトル券：{tickets} / 3</div>
        <button
          className={`px-3 py-2 rounded border ${!canAdRecoverTickets ? "opacity-60 cursor-not-allowed" : ""}`}
          disabled={!canAdRecoverTickets}
          onClick={doAdRecoverTickets}
        >
          {canAdRecoverTickets ? "広告でバトル券 全回復（今すぐ）" : `広告でバトル券 全回復（${COOLDOWN_MIN_TICKET}分クールダウン）`}
        </button>
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
          {tickets >= 3 ? "バトル券は満タンです。" : cdTicketsRemain > 0 ? `再使用まで ${formatMMSS(cdTicketsRemain)}` : "今すぐ使用できます。"}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <Link to="/">ホームへ</Link>
      </div>
    </div>
  );
}
