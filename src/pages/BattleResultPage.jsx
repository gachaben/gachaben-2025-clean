import React, { useEffect, useState } from "react";
import { auth } from "@/fbkit";
import { saveBattleRecord } from "@/utils/saveBattleRecord";

export default function BattleResultPage() {
  const [msg, setMsg] = useState("saving...");
  const [recId, setRecId] = useState(null);

  useEffect(() => {
    (async () => {
      const user = auth.currentUser;
      if (!user) { setMsg("未ログインです"); return; }

      const sp = new URLSearchParams(location.search);
      const state = history.state?.usr || {};
      const opponent = sp.get("opponent") ?? state.opponent ?? "CPU";
      const result   = (sp.get("result") ?? state.result ?? "win").toLowerCase();
      const score    = Number(sp.get("score") ?? state.score ?? 0);

      try {
        const id = await saveBattleRecord({
          uid: user.uid,
          opponent,
          result: result === "lose" ? "lose" : result === "draw" ? "draw" : "win",
          score,
          meta: { from: "BattleResultPage" }
        });
        setRecId(id);
        setMsg("保存しました！");
      } catch (e) {
        setMsg("保存に失敗しました: " + String(e));
      }
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>Battle Result</h1>
      <p>{msg}</p>
      {recId && <p>id: <code>{recId}</code></p>}
      <p><a href="/battle/history">履歴を見る</a></p>
      <p><a href="/login">Loginへ戻る</a></p>
    </div>
  );
}
