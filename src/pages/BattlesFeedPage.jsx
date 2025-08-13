// src/pages/BattlesFeedPage.jsx
import React from "react";
import { subscribeRecentBattles } from "../lib/battlesFeed";

export default function BattlesFeedPage() {
  const [rows, setRows] = React.useState([]);
  const [err, setErr] = React.useState(null);

  React.useEffect(() => {
    const unsub = subscribeRecentBattles(setRows, setErr, 20);
    return () => unsub();
  }, []);

  return (
    <div style={{ padding: "16px", maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 12 }}>最新バトル（20件）</h2>

      {err && (
        <div style={{ color: "crimson", marginBottom: 12 }}>
          ⚠ 読み込みエラー: {String(err.message || err)}
        </div>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {rows.map((r) => (
          <li key={r.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 12,
                marginBottom: 10
              }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {r.createdAt?.toDate
                ? r.createdAt.toDate().toLocaleString()
                : "pending…"}
              {" · "}ID: {r.id}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
              <div style={{ flex: 1 }}>
                <strong>あなた</strong>
                <div>{r.me?.name} / {r.me?.start} → {r.me?.end}</div>
              </div>
              <div style={{ flex: 1 }}>
                <strong>相手</strong>
                <div>{r.enemy?.name} / {r.enemy?.start} → {r.enemy?.end}</div>
              </div>
            </div>
            <div style={{ marginTop: 6, fontSize: 13 }}>
              rounds: {r.roundsPlayed ?? "-"} / questions: {r.questionCount ?? "-"} / winner: {r.winner ?? "-"}
            </div>
          </li>
        ))}
      </ul>

      {rows.length === 0 && !err && (
        <div style={{ opacity: 0.7 }}>まだデータがありません。</div>
      )}
    </div>
  );
}
