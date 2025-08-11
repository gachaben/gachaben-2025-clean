// src/pages/BattleStartPage.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { callCreateBattle } from "../firebase";

/**
 * 期待する遷移元:
 *  - navigate("/battle/start", { state: { selectedItemId, enemyItemId? } })
 *  - または URL に ?itemId=xxxx を付与
 */
export default function BattleStartPage() {
  const nav = useNavigate();
  const { state } = useLocation();

  // 1) 優先: location.state.selectedItemId
  // 2) 次点: URLクエリ ?itemId=...
  const selectedItemIdFromState = state?.selectedItemId ?? null;
  const selectedItemIdFromQuery = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get("itemId");
  }, []);
  const selectedItemId = selectedItemIdFromState || selectedItemIdFromQuery || null;

  const [loading, setLoading] = useState(false);
  const [qCount, setQCount] = useState(3); // デフォ3問

  const goSelectItem = () => {
    // あなたのルーティングに合わせてどちらか：
    // nav("/battle/rank-select");
    nav("/battle/item-select");
  };

  const start = async () => {
    if (!selectedItemId) {
      alert("まずアイテムを選んでね！");
      return goSelectItem();
    }
    setLoading(true);
    try {
      // ★ Cloud Functions (callable) 呼び出し
      const payload = {
        selectedItemId,                 // ← 関数側の期待キー名に合わせる
        questionCount: Number(qCount),  // ← 数値で渡す
      };
      console.log("[createBattle] payload:", payload);

      const res = await callCreateBattle(payload);
      console.log("[createBattle] response:", res);

      // 返却は {"data":{"battleId":"..."}}
      // もしくは {"data":{"result":{"battleId":"..."} }}
      const battleId = res?.data?.battleId || res?.data?.result?.battleId;
      if (!battleId) throw new Error("battleId が返ってきていない");

      // ★ 自動遷移（子どもはIDを見ない）
      nav(`/battle/${battleId}`, {
        state: {
          battleId,
          selectedItemId,
          questionCount: Number(qCount),
        },
        replace: true,
      });
    } catch (e) {
      console.error(e);
      alert("バトル作成に失敗しました: " + (e.message ?? String(e)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <h1>バトル開始</h1>

      {/* 選択中アイテムの確認（IDは子どもに見せないUIでもOK） */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span>えらんだアイテム：</span>
        {selectedItemId ? (
          <span style={{ fontWeight: 600 }}>{/* 子どもUIなら名前/画像に置換 */}
            {selectedItemId}
          </span>
        ) : (
          <span style={{ color: "#999" }}>（まだ未選択）</span>
        )}
        <button onClick={goSelectItem} style={{ marginLeft: 8 }}>
          アイテムをえらぶ
        </button>
      </div>

      {/* 試合数ボタン（ワンタップ） */}
      <div style={{ display: "flex", gap: 8 }}>
        {[1, 3, 5].map(n => (
          <button
            key={n}
            onClick={() => setQCount(n)}
            disabled={loading}
            style={{
              padding: "8px 14px",
              border: qCount === n ? "2px solid #000" : "1px solid #ccc",
              fontWeight: qCount === n ? 700 : 400,
              cursor: "pointer",
            }}
          >
            {n}問
          </button>
        ))}
      </div>

      <div>
        <button
          onClick={start}
          disabled={loading || !selectedItemId}
          style={{
            padding: "10px 18px",
            fontSize: 16,
            fontWeight: 700,
            opacity: loading || !selectedItemId ? 0.6 : 1,
            cursor: loading || !selectedItemId ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "つくっています…" : "バトルスタート"}
        </button>
      </div>

      {/* デバッグ用（大人向け）：本番では消してOK */}
      <details>
        <summary>開発者メモ</summary>
        <pre style={{ background: "#f7f7f7", padding: 8 }}>
{JSON.stringify({ selectedItemId, qCount }, null, 2)}
        </pre>
      </details>
    </div>
  );
}
