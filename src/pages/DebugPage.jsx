// ------------------------------------------------------
// src/pages/DebugPage.jsx
// Firebase Functions（createBattle / commitRound）デバッグ用
// ------------------------------------------------------
import React, { useEffect, useState } from "react";
import { listCollection, countCollection } from "@/lib/debug";
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import { app } from "@/fbkit/app";

// ✅ Emulator接続（1回だけ）
const functions = getFunctions(app);
connectFunctionsEmulator(functions, "localhost", 5002);


export default function DebugPage() {
  const [counts, setCounts] = useState({ mistakes: 0, problems: 0 });
  const [mistakes, setMistakes] = useState([]);
  const [problems, setProblems] = useState([]);

  // ✅ Firestore データ再読込
  const refresh = async () => {
    try {
      const [mCnt, pCnt] = await Promise.all([
        countCollection("mistakes"),
        countCollection("problems"),
      ]);
      setCounts({ mistakes: mCnt, problems: pCnt });

      const [mRows, pRows] = await Promise.all([
        listCollection("mistakes"),
        listCollection("problems"),
      ]);
      setMistakes(mRows ?? []); // 安全ガード
      setProblems(pRows ?? []); // 安全ガード
    } catch (err) {
      console.error("❌ refresh error:", err);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // ✅ バトル作成（Functions呼び出し）
  const handleCreateBattle = async () => {
    try {
      const createBattle = httpsCallable(functions, "createBattle");
      const res = await createBattle({
        opponentId: "cpu-normal",
        cpuLevel: "N",
        startPw: 1000,
      });
      console.log("✅ createBattle result:", res.data);
      alert(`バトル作成OK！ID: ${res.data.battleId}`);
    } catch (err) {
      console.error("❌ エラー:", err);
      alert("エラー発生：" + err.message);
    }
  };

  // ✅ Box コンポーネント
  const Box = ({ title, rows }) => {
    const safeRows = Array.isArray(rows) ? rows : []; // 安全ガード
    return (
      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
        <h3 style={{ margin: "0 0 8px" }}>{title}</h3>
        <div style={{ display: "grid", gap: 6 }}>
          {safeRows.map((r) => (
            <div
              key={r.id}
              style={{
                padding: 8,
                background: "#fafafa",
                border: "1px solid #eee",
                borderRadius: 6,
              }}
            >
              <div style={{ fontFamily: "monospace" }}>{r.id}</div>
              <div style={{ fontSize: 12, color: "#666" }}>
                {r.problemId ? (
                  <>
                    problemId: {r.problemId} / times: {r.times} / status:{" "}
                    {r.status}
                  </>
                ) : null}
                {r.body?.question ? <>Q: {r.body.question}</> : null}
              </div>
            </div>
          ))}
          {safeRows.length === 0 && (
            <div style={{ color: "#999" }}>（データなし）</div>
          )}
        </div>
      </div>
    );
  };

  // ✅ ここから return
  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <h2>⚙️ Debug Dashboard</h2>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={refresh}>再読込</button>
        <button onClick={() => listCollection("mistakes")}>
          Console に mistakes を吐く
        </button>
        <button onClick={() => listCollection("problems")}>
          Console に problems を吐く
        </button>
        <button
          onClick={handleCreateBattle}
          style={{
            background: "#eef",
            border: "1px solid #66f",
            borderRadius: 6,
            padding: "6px 12px",
          }}
        >
          ⚔️ createBattle 実行
        </button>
      </div>

      <div style={{ color: "#555" }}>
        counts → mistakes: <b>{counts.mistakes}</b> / problems:{" "}
        <b>{counts.problems}</b>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Box title="mistakes (latest)" rows={mistakes} />
        <Box title="problems (latest)" rows={problems} />
      </div>
    </div>
  );
}
