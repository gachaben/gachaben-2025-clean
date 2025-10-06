// src/pages/DebugPage.jsx
import React, { useEffect, useState } from "react";
import { listCollection, countCollection } from "@/lib/debug";

export default function DebugPage() {
  const [counts, setCounts] = useState({ mistakes: 0, problems: 0 });
  const [mistakes, setMistakes] = useState([]);
  const [problems, setProblems] = useState([]);

  // 再読込処理
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

  const Box = ({ title, rows }) => (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
      <h3 style={{ margin: "0 0 8px" }}>{title}</h3>
      <div style={{ display: "grid", gap: 6 }}>
        {rows.map((r) => (
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
                <>problemId: {r.problemId} / times: {r.times} / status: {r.status}</>
              ) : null}
              {r.body?.question ? <>Q: {r.body.question}</> : null}
            </div>
          </div>
        ))}
        {rows.length === 0 && <div style={{ color: "#999" }}>（データなし）</div>}
      </div>
    </div>
  );

  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <h2>Debug Dashboard</h2>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={refresh} style={{ padding: "6px 12px" }}>
          再読込
        </button>
        <button
          onClick={() => listCollection("mistakes")}
          style={{ padding: "6px 12px" }}
        >
          Console に mistakes を吐く
        </button>
        <button
          onClick={() => listCollection("problems")}
          style={{ padding: "6px 12px" }}
        >
          Console に problems を吐く
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
