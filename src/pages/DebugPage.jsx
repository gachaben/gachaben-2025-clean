// ------------------------------------------------------
// src/pages/DebugPage.jsx（create → commit 連動版）
// ------------------------------------------------------
import React, { useState } from "react";

export default function DebugPage() {
  const [result, setResult] = useState("");
  const [battleId, setBattleId] = useState(""); // ← 追加
  const BASE_URL = "http://127.0.0.1:5002/gachaben-2025/us-central1";

  // ✅ createBattleFn 実行
  const handleCreateBattle = async () => {
    try {
      const res = await fetch(`${BASE_URL}/createBattleFn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: "debug-user", cpuLevel: "N" }),
      });
      const data = await res.json();
      console.log("createBattleFn:", data);
      if (data?.battleId) {
        setBattleId(data.battleId); // ← IDを保存
      }
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult(JSON.stringify({ error: String(err) }, null, 2));
    }
  };

  // ✅ commitRoundFn 実行
  const handleCommitRound = async () => {
    if (!battleId) {
      setResult("❌ 先に createBattle を実行してください。");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/commitRoundFn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: "debug-user",
          battleId, // ← ここを連動
          round: 1,
        }),
      });
      const data = await res.json();
      console.log("commitRoundFn:", data);
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult(JSON.stringify({ error: String(err) }, null, 2));
    }
  };

  // ✅ finishBattleFn 実行
  const handleFinishBattle = async () => {
    if (!battleId) {
      setResult("❌ 先に createBattle を実行してください。");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/finishBattleFn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: "debug-user", battleId }),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult(JSON.stringify({ error: String(err) }, null, 2));
    }
  };

  // ✅ pingFn 実行
  const handlePing = async () => {
    const res = await fetch(`${BASE_URL}/pingFn`);
    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
  };

  // ✅ UI
  return (
    <div style={{ padding: "20px" }}>
      <h2>🐞 Debug Dashboard</h2>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={handleCreateBattle} style={{ background: "#4CAF50", color: "#fff", padding: "10px" }}>
          createBattle 実行
        </button>
        <button onClick={handleCommitRound} style={{ background: "#2196F3", color: "#fff", padding: "10px" }}>
          commitRound 実行
        </button>
        <button onClick={handleFinishBattle} style={{ background: "#f44336", color: "#fff", padding: "10px" }}>
          finishBattle 実行
        </button>
        <button onClick={handlePing} style={{ background: "#9C27B0", color: "#fff", padding: "10px" }}>
          pingFn 実行
        </button>
      </div>

      <p style={{ fontSize: "14px", color: "#444" }}>
        現在の battleId: <strong>{battleId || "(未作成)"}</strong>
      </p>

      <pre
        style={{
          background: "#000",
          color: "#0f0",
          padding: "10px",
          borderRadius: "6px",
          minHeight: "100px",
        }}
      >
        {result || "-"}
      </pre>
    </div>
  );
}
