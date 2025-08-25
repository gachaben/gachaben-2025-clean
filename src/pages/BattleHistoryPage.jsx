import React, { useEffect, useState } from "react";
import { auth } from "@/fbkit";
import { getRecentBattleRecords } from "@/utils/saveBattleRecord";

export default function BattleHistoryPage() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("loading...");

  useEffect(() => {
    (async () => {
      const user = auth.currentUser;
      if (!user) { setMsg("未ログインです"); return; }
      try {
        const items = await getRecentBattleRecords(user.uid, 20);
        setRows(items);
        setMsg(items.length ? "" : "履歴なし");
      } catch (e) {
        setMsg("読み込み失敗: " + String(e));
      }
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>Battle History</h1>
      {msg && <p>{msg}</p>}
      <ul>
        {rows.map(r => (
          <li key={r.id}>
            <strong>{String(r.result).toUpperCase()}</strong> vs {r.opponent} / score: {r.score ?? 0} /
            <span> createdAt: {(r.createdAt && r.createdAt.toDate && r.createdAt.toDate().toLocaleString()) || "-"}</span>
          </li>
        ))}
      </ul>
      <p><a href="/login">Loginへ戻る</a></p>
    </div>
  );
}
