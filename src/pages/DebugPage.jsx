// ------------------------------------------------------
// Firebase Functions デバッグ用（CORS対応・Emulator接続版）
// ------------------------------------------------------
import React, { useState } from "react";

export default function DebugPage() {
  const [result, setResult] = useState(null);

  const handleCreateBattle = async () => {
    try {
      console.log("▶ createBattle 呼び出し開始");

      const res = await fetch(
        "http://localhost:5002/gachaben-2025/us-central1/createBattle",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            opponentId: "cpu-normal",
            cpuLevel: "N",
            startPw: 1000,
          }),
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      console.log("✅ createBattle result:", data);
      alert(`バトル作成OK!\nID: ${data.battleId}`);
      setResult(data);
    } catch (err) {
      console.error("❌ createBattle エラー:", err);
      alert("createBattle に失敗しました");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-3">⚙ Debug Dashboard</h2>

      <button
        onClick={handleCreateBattle}
        className="mt-3 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        ▶ createBattle 実行
      </button>

      {result && (
        <pre className="mt-4 p-2 bg-gray-100 rounded text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
