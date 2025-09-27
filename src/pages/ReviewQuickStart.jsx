// src/pages/ReviewQuickStart.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/fbkit";
import { fullRecoverHearts } from "../lib/hearts";

const COOLDOWN_MIN = 10;

// Date/Timestamp/number/undefined を安全に ms に変換
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
  const auth = getFirebaseAuth();
  const db = getFirestoreDb();

  const [uid, setUid] = useState(auth.currentUser?.uid ?? null);
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const uid = getAuth().currentUser?.uid;

  const [user, setUser] = useState(null);
  const [nowMs, setNowMs] = useState(Date.now()); // 秒カウントダウン用

  // authの変化を追従
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => unsub();
  }, [auth]);

  const fmt = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return { format: (d) => d?.toString?.() ?? "" };
    }
  }, []);
    if (!uid) return;
    const un = onSnapshot(doc(db, "users", uid), (snap) => {
      setUser(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
    return () => un && un();
  }, [uid]);

  // 1秒ごとに「現在時刻」を更新
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const hearts = user?.hearts ?? 0;
  const lastAdAtMs = tsToMs(user?.lastAdHeartsAt);

  const cdTotalMs = COOLDOWN_MIN * 60_000;
  const cdRemainMs = Math.max(0, cdTotalMs - (nowMs - lastAdAtMs));
  const canAdRecover = hearts < 5 && cdRemainMs === 0;

  const toDate = (val) => {
    if (val?.toDate) return val.toDate();
    if (typeof val === "number") return new Date(val);
    if (typeof val === "string") return new Date(val);
    return null;
  };

  // mistakes 購読
  useEffect(() => {
    if (!uid) {
      setMistakes([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "mistakes"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc"),
      limit(100)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setMistakes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (e) => {
        console.error("[review-quickstart] onSnapshot error:", e);
        setError(e?.message || "読み込みに失敗しました");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [db, uid]);

  if (loading) return <div style={{ padding: 16 }}>読み込み中...</div>;
  if (error) return <div style={{ padding: 16 }}>エラー: {error}</div>;

  const Empty = () => (
    <div
      style={{
        marginTop: 24,
        border: "1px dashed #bbb",
        padding: 24,
        borderRadius: 12,
        textAlign: "center",
        background: "#fafafa",
      }}
    >
      <div style={{ fontSize: 16, marginBottom: 8 }}>復習対象はまだありません 🎉</div>
      <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 16 }}>
        練習やチャレンジで新しい問題に挑戦してみよう
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button
          onClick={() => navigate("/")}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "white" }}
        >
          トップへ
        </button>
  const doAdRecover = async () => {
    if (!uid) return alert("ログインを確認してください");
    if (hearts >= 5) return alert("❤は満タンです！");
    if (!canAdRecover) return; // ガード
    try {
      // 本来は広告SDKの視聴完了イベント後に実行
      await fullRecoverHearts(uid, { reason: "ad" });
      alert("広告視聴ボーナスで❤が全回復しました！");
    } catch (e) {
      console.error("ad recover error:", e);
      alert("回復に失敗しました。時間をおいて再度お試しください。");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>復習モード QuickStart</h2>

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
          <small>まず「サンプル投入」で動作確認してみよう</small>
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
          ❤スタミナ: {hearts} / 5
        </div>
        <button
          onClick={() => navigate("/review/quick-seed")}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #0aa", background: "#0ff2" }}
        >
          サンプル投入
          className={`px-3 py-2 rounded border ${
            !canAdRecover ? "opacity-60 cursor-not-allowed" : ""
          }`}
          disabled={!canAdRecover}
          onClick={doAdRecover}
        >
          {canAdRecover
            ? "広告視聴で❤全回復（今すぐ使用可能）"
            : `広告視聴で❤全回復（${COOLDOWN_MIN}分クールダウン）`}
        </button>
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
          {hearts >= 5
            ? "❤は満タンです"
            : cdRemainMs > 0
            ? `再使用まで ${formatMMSS(cdRemainMs)}`
            : "今すぐ使用できます"}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 16 }}>
      <h1 className="text-xl font-bold mb-2">復習モード QuickStart</h1>

      {mistakes.length === 0 ? (
        <Empty />
      ) : (
        <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
          {mistakes.map((m) => {
            const created = toDate(m.createdAt);
            return (
              <li
                key={m.id}
                style={{
                  border: "1px solid #ddd",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                  display: "grid",
                  gap: 4,
                }}
              >
                <div style={{ fontWeight: 600 }}>{m.text}</div>
                <div>あなたの選択: {String(m.picked ?? "")}</div>
                <div>
                  正解:{" "}
                  {Array.isArray(m.answer)
                    ? JSON.stringify(m.answer)
                    : String(m.answer ?? "")}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  追加日時: {created ? fmt.format(created) : "-"}
                </div>
                <div>
                  <button
                    onClick={() =>
                      navigate(`/review/play/${encodeURIComponent(m.id)}`)
                    }
                    style={{
                      marginTop: 8,
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #09f",
                      background: "#09f2",
                    }}
                  >
                    この問題で復習する
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* デバッグ用 */}
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
