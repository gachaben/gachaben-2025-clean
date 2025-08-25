// src/pages/ReviewQuickStart.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { fullRecoverHearts } from "../lib/hearts";

const COOLDOWN_MIN = 10;

// いろんな型(Date/Timestamp/number/undefined)を安全に ms に変換
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

export default function ReviewQuickStart() {
  const navigate = useNavigate();
  const uid = getAuth().currentUser?.uid;

  const [user, setUser] = useState(null);
  const [nowMs, setNowMs] = useState(Date.now()); // ← 秒カウントダウン用

  // User doc 購読
  useEffect(() => {
    if (!uid) return;
    const un = onSnapshot(doc(db, "users", uid), (snap) => {
      setUser(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
    return () => un && un();
  }, [uid]);

  // 1秒ごとに「現在時刻」を更新（軽いです）
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const hearts = user?.hearts ?? 0;
  const lastAdAtMs = tsToMs(user?.lastAdHeartsAt);

  const cdTotalMs = COOLDOWN_MIN * 60_000;
  const cdRemainMs = Math.max(0, cdTotalMs - (nowMs - lastAdAtMs));
  const canAdRecover = hearts < 5 && cdRemainMs === 0;

  const doAdRecover = async () => {
    if (!uid) return alert("ログインを確認してください");
    if (hearts >= 5) return alert("❤は満タンです！");
    if (!canAdRecover) return; // ガード
    try {
      // 本来は広告SDKの視聴完了イベント後に実行
      await fullRecoverHearts(uid, { reason: "ad" });
      alert("広告視聴ボーナス：❤が全回復しました！");
    } catch (e) {
      console.error("ad recover error:", e);
      alert("回復に失敗しました。時間をおいて再度お試しください。");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>復習モード（QuickStart）</h2>

      <div
        style={{
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8,
          margin: "12px 0",
        }}
      >
        <div style={{ marginBottom: 8 }}>
          まだ復習する問題はありません<span role="img" aria-label="sparkles">✨</span>
          <br />
          <small>（まずは「サンプル投入」で動作確認してみよう）</small>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            className="border px-3 py-2 rounded"
            onClick={() => navigate("/review/seed")}
          >
            サンプル投入
          </button>
          <Link className="border px-3 py-2 rounded" to="/review/list">
            一覧へ
          </Link>
        </div>
      </div>

      {/* 広告で❤全回復セクション */}
      <div
        style={{
          padding: 12,
          border: "1px dashed #bbb",
          borderRadius: 8,
          margin: "12px 0",
          background: "#fafafa",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>
          ❤スタミナ：{hearts} / 5
        </div>
        <button
          className={`px-3 py-2 rounded border ${
            !canAdRecover ? "opacity-60 cursor-not-allowed" : ""
          }`}
          disabled={!canAdRecover}
          onClick={doAdRecover}
        >
          {canAdRecover
            ? "広告で❤全回復（今すぐ使用可能）"
            : `広告で❤全回復（${COOLDOWN_MIN}分クールダウン）`}
        </button>
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
          {hearts >= 5
            ? "❤は満タンです。"
            : cdRemainMs > 0
            ? `再使用まで ${formatMMSS(cdRemainMs)}`
            : "今すぐ使用できます。"}
        </div>
      </div>

      {/* ちょいデバッグ（数値把握用） */}
      <div
        style={{
          marginTop: 12,
          padding: 12,
          border: "1px solid #eee",
          borderRadius: 8,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>User Debug</div>
        <div style={{ fontSize: 13, lineHeight: 1.7 }}>
          <div>uid: <code>{uid || "-"}</code></div>
          <div>hearts: <code>{hearts}</code></div>
          <div>battleTickets: <code>{user?.battleTickets ?? "-"}</code></div>
          <div>daily.date: <code>{user?.daily?.date ?? "-"}</code></div>
          <div>
            lastAdHeartsAt:{" "}
            <code>
              {(() => {
                const ms = lastAdAtMs;
                return ms ? new Date(ms).toLocaleString() : "-";
              })()}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
