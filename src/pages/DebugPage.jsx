// ------------------------------------------------------
// src/pages/DebugPage.jsx（Express API対応 / CORS安定版）
// ------------------------------------------------------
import React, { useState } from "react";

export default function DebugPage() {
  const [result, setResult] = useState("");
  const [battleId, setBattleId] = useState("");
  const BASE_URL = "http://127.0.0.1:5002/gachaben-2025/us-central1/api"; // ← 修正ポイント！

  // ✅ createBattle 実行
  const handleCreateBattle = async () => {
    try {
      const res = await fetch(`${BASE_URL}/createBattle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: "debug-user", cpuLevel: "N" }),
      });
      const data = await res.json();
      console.log("createBattle:", data);
      if (data?.battleId) {
        setBattleId(data.battleId);
      }
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("createBattle Error:", err);
      setResult(JSON.stringify({ error: String(err) }, null, 2));
    }
  };

  // ✅ commitRound 実行
  const handleCommitRound = async () => {
    if (!battleId) {
      setResult("❌ 先に createBattle を実行してください。");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/commitRound`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: "debug-user",
          battleId,
          round: 1,
        }),
      });
      const data = await res.json();
      console.log("commitRound:", data);
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("commitRound Error:", err);
      setResult(JSON.stringify({ error: String(err) }, null, 2));
    }
  };

  // ✅ finishBattle 実行
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
      console.log("finishBattleFn:", data);
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("finishBattleFn Error:", err);
      setResult(JSON.stringify({ error: String(err) }, null, 2));
    }
  };

  // ✅ ping 実行
  const handlePing = async () => {
    try {
      const res = await fetch(`${BASE_URL}/pingFn`);
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("pingFn Error:", err);
      setResult(JSON.stringify({ error: String(err) }, null, 2));
    }
  };

  // ✅ UI部分
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
