// ------------------------------------------------------
// src/pages/DebugPage.jsx（修正版 / 動的 battleId 連携）
// ------------------------------------------------------
import React, { useState } from "react";

export default function DebugPage() {
  const [result, setResult] = useState("結果がここに表示されます");
  const [battleId, setBattleId] = useState(""); // ✅ createBattleで取得したIDを保存

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

      // ✅ createBattle 実行時のみ ID を保存
      if (name === "createBattle" && data.battleId) {
        setBattleId(data.battleId);
        console.log("🆔 battleId 保存:", data.battleId);
      }
    } catch (err) {
      console.error(err);
      setResult(err.message);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>⚙️ Debug Dashboard</h1>

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
              battleId: battleId || "未設定",
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
        >
          🌀 commitRound 実行
        </button>

        {/* ✅ finishBattle */}
        <button
          onClick={() =>
            callFunction("finishBattle", {
              battleId: battleId || "未設定",
              result: "win",
            })
          }
          style={{
            background: "#e53935",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 6,
          }}
        >
          🔥 finishBattle 実行
        </button>
      </div>

      <div style={{ marginTop: 16, fontWeight: "bold" }}>
        現在の battleId：{" "}
        <span style={{ color: battleId ? "#007bff" : "gray" }}>
          {battleId || "（未設定）"}
        </span>
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
