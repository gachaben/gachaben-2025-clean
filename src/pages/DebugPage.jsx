// ------------------------------------------------------
// src/pages/DebugPage.jsx（commit / finish対応・完全動作版）
// ------------------------------------------------------
import React, { useState } from "react";

export default function DebugPage() {
  const [battleId, setBattleId] = useState(null);
  const [result, setResult] = useState("");

  // ✅ テスト用固定UID（Auth Emulator用）
  const TEST_UID = "test-user";

  const baseURL = "http://localhost:5002/gachaben-2025/us-central1";

  // 共通Fetch関数
  const callFunction = async (endpoint, body = {}) => {
    try {
      const res = await fetch(`${baseURL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: TEST_UID, battleId, ...body }), // ← battleIdも常に送る！
      });
      const data = await res.json();
      console.log(`[${endpoint}]`, data);
      setResult(JSON.stringify(data, null, 2));

      // ✅ createBattle 成功時 → battleIdを保存
      if (endpoint === "createBattleFn" && data.battleId) {
        setBattleId(data.battleId);
      }
    } catch (err) {
      setResult(JSON.stringify({ error: err.message }));
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🧩 Debug Dashboard</h2>
      <p>現在の battleId：{battleId ?? "ー"}</p>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button
          style={{ background: "#3b82f6", color: "white", padding: "1rem" }}
          onClick={() => callFunction("createBattleFn")}
        >
          🌀 createBattle 実行
        </button>

        <button
          style={{ background: "#10b981", color: "white", padding: "1rem" }}
          onClick={() => callFunction("commitRoundFn")}
        >
          🔵 commitRound 実行
        </button>

        <button
          style={{ background: "#ef4444", color: "white", padding: "1rem" }}
          onClick={() => callFunction("finishBattleFn")}
        >
          🔴 finishBattle 実行
        </button>
      </div>

      <pre
        style={{
          marginTop: "1rem",
          background: "#111",
          color: "#0f0",
          padding: "1rem",
        }}
      >
        {result}
      </pre>
    </div>
  );
}
