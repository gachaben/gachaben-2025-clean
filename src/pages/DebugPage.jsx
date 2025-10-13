// ------------------------------------------------------
// 📄 src/pages/DebugPage.jsx
// Mistakes / Problems 確認 + createBattle呼び出しテスト
// ------------------------------------------------------

// ------------------------------------------------------
// src/pages/DebugPage.jsx（修正版）
// ------------------------------------------------------
import React, { useEffect, useState } from "react";
import { listCollection, countCollection } from "@/lib/debug";

// ✅ ✅ 修正ポイントここ！
import { app } from "@/fbkit/app";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";


export default function DebugPage() {
  const [counts, setCounts] = useState({ mistakes: 0, problems: 0 });
  const [mistakes, setMistakes] = useState([]);
  const [problems, setProblems] = useState([]);
  const [battleResult, setBattleResult] = useState(null);

  // ✅ Firestore読み込み処理
  const refresh = async () => {
    const [mCnt, pCnt] = await Promise.all([
      countCollection("mistakes"),
      countCollection("problems"),
    ]);
    setCounts({ mistakes: mCnt, problems: pCnt });

    const [mRows, pRows] = await Promise.all([
      listCollection("mistakes"),
      listCollection("problems"),
    ]);
    setMistakes(mRows);
    setProblems(pRows);
  };

  useEffect(() => {
    refresh();
  }, []);

  // ✅ createBattle 実行処理
  const handleCreateBattle = async () => {
    try {
      const functions = getFunctions(app);
      connectFunctionsEmulator(functions, "127.0.0.1", 5002);
      const createBattle = httpsCallable(functions, "createBattle");

      const res = await createBattle({
        opponentId: "cpu-normal",
        cpuLevel: "N",
        startPw: 1000,
      });

      console.log("✅ createBattle result:", res.data);
      setBattleResult(res.data);
      alert(`バトル作成OK！ID: ${res.data.battleId}`);
    } catch (err) {
      console.error("❌ エラー:", err);
      alert("エラー発生：" + err.message);
    }
  };

  // ✅ 表示用サブコンポーネント
const Box = ({ title, rows = [] }) => (
  <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
    <h3 style={{ margin: "0 0 8px" }}>{title}</h3>
    <div style={{ display: "grid", gap: 6 }}>
      {rows && rows.length > 0 ? (
        rows.map((r) => (
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
                  problemId: {r.problemId} / times: {r.times} / status: {r.status}
                </>
              ) : null}
              {r.body?.question ? <>Q: {r.body.question}</> : null}
            </div>
          </div>
        ))
      ) : (
        <div style={{ color: "#999" }}>（データなし）</div>
      )}
    </div>
  </div>
);


  // ✅ 画面本体
  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <h2>🧩 Debug Dashboard</h2>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={refresh} style={{ padding: "6px 12px" }}>
          🔄 再読込
        </button>
        <button onClick={() => listCollection("mistakes")} style={{ padding: "6px 12px" }}>
          Console に mistakes を吐く
        </button>
        <button onClick={() => listCollection("problems")} style={{ padding: "6px 12px" }}>
          Console に problems を吐く
        </button>
        <button onClick={handleCreateBattle} style={{ padding: "6px 12px", background: "#eef", border: "1px solid #99f", borderRadius: 6 }}>
          ⚔️ createBattle 実行
        </button>
      </div>

      <div style={{ color: "#555" }}>
        counts → mistakes: <b>{counts.mistakes}</b> / problems:{" "}
        <b>{counts.problems}</b>
      </div>

      {battleResult && (
        <div style={{ padding: 12, background: "#f9f9ff", borderRadius: 8, border: "1px solid #ccf" }}>
          <div>✅ Battle created!</div>
          <div style={{ fontFamily: "monospace" }}>ID: {battleResult.battleId}</div>
          <div>{battleResult.message}</div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Box title="mistakes (latest)" rows={mistakes} />
        <Box title="problems (latest)" rows={problems} />
      </div>
    </div>
  );
}
