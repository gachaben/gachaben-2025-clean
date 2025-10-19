// ------------------------------------------------------
// src/pages/DebugPage.jsx（v1.7b デバッグ）
// Firebase Functions（createBattle / commitRound / finishBattle）
// ------------------------------------------------------
import React, { useState } from "react";

export default function DebugPage() {
  const [result, setResult] = useState("結果がここに表示されます");
  const [battleId, setBattleId] = useState("");

  // ✅ 共通 fetch ヘルパー
  const callFunction = async (name, payload) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5002/gachaben-2025-clean/us-central1/${name}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
      if (data.battleId) setBattleId(data.battleId);
    } catch (err) {
      console.error(err);
      setResult(err.message);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>⚙️ Debug Dashboard</h1>

      <p style={{ marginTop: 8 }}>
        現在の battleId：{" "}
        {battleId ? (
          <a href="#" onClick={(e) => e.preventDefault()}>
            {battleId}
          </a>
        ) : (
          "—"
        )}
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        {/* ✅ createBattle */}
        <button
          onClick={() => callFunction("createBattle", { uid: "demo-user-001" })}
          style={{
            background: "#4ea5ff",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 6,
          }}
        >
          ▶ createBattle 実行
        </button>

        {/* ✅ commitRound */}
        <button
          onClick={() =>
            callFunction("commitRound", {
              battleId,
              round: 1,
              correct: true,
            })
          }
          style={{
            background: "#4caf50",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 6,
          }}
          disabled={!battleId}
        >
          🌀 commitRound 実行
        </button>

        {/* ✅ finishBattle */}
        <button
          onClick={() =>
            callFunction("finishBattle", {
              battleId,
              result: "win",
              userId: "demo-user-001", // ✅ DP加算のために送信
            })
          }
          style={{
            background: "#e53935",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 6,
          }}
          disabled={!battleId}
        >
          🔥 finishBattle 実行
        </button>
      </div>

      <pre
        style={{
          background: "#fafafa",
          marginTop: 20,
          padding: 12,
          borderRadius: 8,
        }}
      >
        {result}
      </pre>
    </div>
  );
}
