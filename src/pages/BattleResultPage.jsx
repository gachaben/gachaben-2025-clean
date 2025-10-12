// ------------------------------------------------------
// 🥊 BattleResultPage.jsx
// バトル終了時の結果保存＋ドレミポイント加算
// ------------------------------------------------------
import React, { useEffect, useState } from "react";
import { auth } from "@/fbkit";
import { saveBattleRecord } from "@/utils/saveBattleRecord";
import { updateDoremiPoints } from "@/utils/updateDoremiPoints";

export default function BattleResultPage() {
  const [msg, setMsg] = useState("saving...");
  const [recId, setRecId] = useState(null);

  useEffect(() => {
    (async () => {
      const user = auth.currentUser;
      if (!user) {
        setMsg("未ログインです");
        return;
      }

      const sp = new URLSearchParams(location.search);
      const state = history.state?.usr || {};
      const opponent = sp.get("opponent") ?? state.opponent ?? "CPU";
      const result = (sp.get("result") ?? state.result ?? "win").toLowerCase();
      const score = Number(sp.get("score") ?? state.score ?? 0);

      try {
        // 🧾 Firestoreに履歴を保存
        const id = await saveBattleRecord({
          uid: user.uid,
          opponent,
          result: ["win", "lose", "draw"].includes(result) ? result : "win",
          score,
          meta: { from: "BattleResultPage" },
        });
        setRecId(id);

        // 🎵 ドレミポイント加算（ルール案①）
        let add = 0;
        if (result === "win") add = 10;
        else if (result === "lose") add = 0;

        // 🔥 7音制覇ボーナス
        if (score >= 7) add += 30;

        if (add > 0) {
          await updateDoremiPoints(user.uid, add);
          console.log(`🎵 ${add}ポイント加算（結果: ${result} / スコア: ${score}）`);
        }

        setMsg(`保存完了！ (+${add}pt)`);
      } catch (e) {
        console.error(e);
        setMsg("保存に失敗しました: " + String(e));
      }
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>Battle Result</h1>
      <p>{msg}</p>
      {recId && (
        <p>
          id: <code>{recId}</code>
        </p>
      )}
      <p>
        <a href="/battle/history">履歴を見る</a>
      </p>
      <p>
        <a href="/login">Loginへ戻る</a>
      </p>
    </div>
  );
}
