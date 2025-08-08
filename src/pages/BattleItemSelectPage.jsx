// src/pages/BattleItemSelectPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  limit as qLimit,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const LS_BATTLE_KEY = "currentBattleId";
const safeUUID = () =>
  (crypto?.randomUUID?.() ?? `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

export default function BattleItemSelectPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();

  // ランクは state から。なければ S を既定
  const initialRank = state?.rank ?? "S";
  const [rank, setRank] = useState(initialRank);

  // questionCount は RankSelect / Zukan 側から来る。なければ 3
  const questionCount = state?.questionCount ?? 3;

  // battleId は state 優先 → localStorage → 生成して保存
  const battleId = useMemo(() => {
    const fromState = state?.battleId;
    if (fromState) return fromState;
    const fromLs = localStorage.getItem(LS_BATTLE_KEY);
    if (fromLs) return fromLs;
    const gen = safeUUID();
    try { localStorage.setItem(LS_BATTLE_KEY, gen); } catch {}
    return gen;
  }, [state?.battleId]);

  // 図鑑から来た事前選択（あれば即開始ボタンを出す）
  const preSelected = state?.selectedItem || null;

  // Firestoreから取得した候補一覧
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 選択中
  const [selected, setSelected] = useState(preSelected);

  // ユーザーID（userItemPowersの取得で必要）
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => unsub();
  }, [auth]);

  // 指定ランクのアイテムを取得 → userItemPowers を uid でマージ
  useEffect(() => {
    let aborted = false;
    (async () => {
      setLoading(true);
      try {
        // 1) rank の items をいくつか拾う（シリーズ縛りは今はしない。必要になれば where("seriesId","==","kontyu") など足す）
        const itemsSnap = await getDocs(
          query(collection(db, "items"), where("rank", "==", rank), qLimit(12))
        );
        const all = itemsSnap.docs.map((d) => ({ itemId: d.id, ...d.data() }));

        // 2) userItemPowers を uid で一括取得 → itemId マップ
        let powersMap = {};
        if (uid) {
          const powersSnap = await getDocs(
            query(collection(db, "userItemPowers"), where("userId", "==", uid))
          );
          powersMap = {};
          powersSnap.forEach((d) => {
            const v = d.data();
            if (v.itemId) powersMap[v.itemId] = v;
          });
        }

        // 3) 画像パス整形 & 強化値マージ（pw/cpt/bpt は userItemPowers 優先）
        const merged = all.map((it) => {
          const imageName = it.imageName || it.name;
          const imagePath = `/images/${it.seriesId}/stage${it.stage}/${imageName}.png`;
          const p = powersMap[it.itemId] || {};
          return {
            ...it,
            imageName,
            imagePath,
            pw: p.pw ?? it.pw ?? 0,
            cpt: p.cpt ?? it.cpt ?? 0,
            bpt: p.bpt ?? it.bpt ?? 0,
          };
        });

        if (!aborted) setItems(merged);
      } catch (e) {
        console.error("ItemSelect load failed:", e);
        if (!aborted) setItems([]);
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => { aborted = true; };
  }, [db, uid, rank]);

 const confirmAndGo = (e) => {
  e?.preventDefault?.();
  e?.stopPropagation?.();
  if (!selected) return;

  // 同ランク一覧から敵をランダム選択（自分と同じなら別のを選ぶ）
  let pool = items && items.length ? items : [selected];
  let enemy = pool[Math.floor(Math.random() * pool.length)];
  if (enemy?.itemId === selected.itemId && pool.length > 1) {
    const others = pool.filter((it) => it.itemId !== selected.itemId);
    enemy = others[Math.floor(Math.random() * others.length)];
  }

  navigate("/battle/play", {
    state: {
      battleId,
      questionCount,
      selectedItem: selected, // 自分
      enemyItem: enemy,       // ← 画像・PW入りで渡す！
    },
  });
};



  return (
    <div className="p-6 bg-yellow-50 min-h-screen" onClick={(e) => e.stopPropagation()}>
      <h2 className="text-lg font-bold mb-3">ランクを選んでバトルキャラを決めよう！</h2>

      {/* 事前選択がある場合、即開始ボタン */}
      {preSelected && (
        <div className="mb-4 p-3 rounded border bg-white">
          <div className="text-sm text-gray-500">図鑑からの選択</div>
          <div className="text-lg font-bold">{preSelected.name}</div>
          <button
            type="button"
            onClick={confirmAndGo}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
          >
            このアイテムで対戦開始 →
          </button>
        </div>
      )}

      {/* ランク切り替え（ページ内で完結・戻り無し） */}
      <div className="flex gap-2 mb-3">
        {["S", "A", "B"].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRank(r)}
            className={`px-3 py-2 rounded border ${rank === r ? "bg-yellow-300" : "bg-white"}`}
          >
            {r}ランクで戦う！
          </button>
        ))}
      </div>

      {/* 一覧 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {loading ? (
          <div className="col-span-2 text-gray-600">読み込み中…</div>
        ) : items.length === 0 ? (
          <div className="col-span-2 text-gray-600">アイテムが見つかりません。</div>
        ) : (
          items.map((it) => (
            <button
              key={it.itemId}
              type="button"
              onClick={() => setSelected(it)}
              className={`p-3 rounded border text-left bg-white ${
                selected?.itemId === it.itemId ? "ring-2 ring-blue-500 bg-blue-50" : ""
              }`}
              title={`攻:${it.cpt ?? 0} / 防:${it.bpt ?? 0} / PW:${it.pw ?? 0}`}
            >
              <div className="font-bold">{it.name}</div>
              <div className="text-xs text-gray-600">PW: {it.pw ?? 0} / 攻: {it.cpt ?? 0} / 防: {it.bpt ?? 0}</div>
            </button>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={confirmAndGo}
        disabled={!selected}
        className={`px-4 py-2 rounded ${
          selected ? "bg-green-600 text-white" : "bg-gray-300 text-gray-500"
        }`}
      >
        対戦開始 →
      </button>
    </div>
  );
}
