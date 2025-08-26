// src/pages/ReviewMistakesPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  where,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth, getFirestoreDb } from "@/firebase";

const auth = getFirebaseAuth();
const db = getFirestoreDb();

function fmt(ts) {
  if (!ts) return "-";
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day} ${hh}:${mi}`;
  } catch {
    return "-";
  }
}

export default function ReviewMistakesPage() {
  const nav = useNavigate();
  const [uid, setUid] = useState(null);

  // 集計
  const [stats, setStats] = useState({ total:0, unreviewed:0, got:0, retry:0 });

  // フィルタ
  const [showOnlyUnreviewed, setShowOnlyUnreviewed] = useState(true);
  const [live, setLive] = useState(true);
  const [pageSize, setPageSize] = useState(20);

  // 取得データ
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [items, setItems] = useState([]); // 一覧（ページ）
  const [cursor, setCursor] = useState(null);

  // カードUI状態
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState(false);

  // 認証待ち
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        nav("/login");
        return;
      }
      setUid(u.uid);
      loadStats(u.uid);
    });
    return () => unsub();
  }, [nav]);

  async function loadStats(uid) {
    try {
      const qAll = query(collection(db,"mistakes"), where("userId","==",uid));
      const snap = await getDocs(qAll);
      let total=0, unreviewed=0, got=0, retry=0;
      snap.forEach(d=>{
        total++;
        const m = d.data() || {};
        if (!m.isReviewed) {
          unreviewed++;
        } else if (m.reviewStatus==="got") {
          got++;
        } else if (m.reviewStatus==="retry") {
          retry++;
        }
      });
      setStats({ total, unreviewed, got, retry });
    } catch(e){
      console.error("[mistakes stats]",e);
    }
  }

  const qBase = useMemo(() => {
    if (!uid) return null;
    const conds = [where("userId", "==", uid)];
    if (showOnlyUnreviewed) {
      conds.push(where("isReviewed", "==", false));
    }
    return query(collection(db, "mistakes"), ...conds, orderBy("createdAt", "desc"), limit(pageSize));
  }, [uid, showOnlyUnreviewed, pageSize]);

  // リストを単発で読み直す（live=false のとき用）
  async function reloadPage() {
    if (!qBase) return;
    const snap = await getDocs(qBase);
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
    setItems(list);
    setCursor(list.length ? snap.docs[snap.docs.length - 1] : null);
  }


  // 初回/依存変更読み込み
  useEffect(() => {
    if (!qBase) return;
    setLoading(true);
    setErr(null);
    setIndex(0);
    setReveal(false);

    let unsub = null;
    (async () => {
      try {
        if (live) {
          unsub = onSnapshot(
            qBase,
            (snap) => {
              const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
              setItems(list);
              setCursor(list.length ? snap.docs[snap.docs.length - 1] : null);
              setLoading(false);
            },
            (e) => {
              console.error("[mistakes live]", e);
              setErr(e);
              setLoading(false);
            }
          );
        } else {
          const snap = await getDocs(qBase);
          const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
          setItems(list);
          setCursor(list.length ? snap.docs[snap.docs.length - 1] : null);
        }
      } catch (e) {
        console.error("[mistakes first]", e);
        setErr(e);
      } finally {
        if (!live) setLoading(false);
      }
    })();

    return () => unsub && unsub();
  }, [qBase, live]);

  // 次のページ（単発読み込み）
  const loadMore = useCallback(async () => {
    if (!uid || !cursor) return;
    setLoading(true);
    setErr(null);
    try {
      const conds = [where("userId", "==", uid)];
      if (showOnlyUnreviewed) conds.push(where("isReviewed", "==", false));
      const qMore = query(
        collection(db, "mistakes"),
        ...conds,
        orderBy("createdAt", "desc"),
        startAfter(cursor),
        limit(pageSize)
      );
      const snap = await getDocs(qMore);
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
      setItems((prev) => [...prev, ...list]);
      setCursor(list.length ? snap.docs[snap.docs.length - 1] : null);
    } catch (e) {
      console.error("[mistakes more]", e);
      setErr(e);
    } finally {
      setLoading(false);
    }
  }, [uid, cursor, showOnlyUnreviewed, pageSize]);

  const current = items[index] || null;

  const markReviewed = useCallback(async (status) => {
    if (!current) return;
    try {
      await updateDoc(doc(db, "mistakes", current.id), {
        isReviewed: true,
        reviewStatus: status, // "got" | "retry"
        reviewedAt: serverTimestamp(),
      });
      setReveal(false);
      setIndex((i) => Math.min(i + 1, Math.max(items.length - 1, 0)));
      // 集計更新
      loadStats(uid);
    } catch (e) {
      alert("更新に失敗: " + e);
    }
  }, [current, items.length, uid]);

  const next = () => {
    setReveal(false);
    setIndex((i) => Math.min(i + 1, Math.max(items.length - 1, 0)));
  };
  const prev = () => {
    setReveal(false);
    setIndex((i) => Math.max(i - 1, 0));
  };
 
  // ------- ダミー Mistake 作成（count 件） -------
  async function addDummyMistakes(count = 1) {
    if (!uid) return;
    try {
      const textsQ = [
        "3×7 は？", "英語で『りんご』は？", "47都道府県の数は？",
        "水の化学式は？", "π(パイ)を小数第1位まで"
      ];
      for (let i = 0; i < count; i++) {
        const pick = textsQ[Math.floor(Math.random() * textsQ.length)];
        const wrong = Math.random() < 0.5;
        const docData = {
          userId: uid,
          isReviewed: false,
          reviewStatus: null,
          createdAt: serverTimestamp(),
          question: { text: pick },
          answer:   { text: wrong ? "まちがい" : "？" },
          correct:  { text: pick === "3×7 は？" ? "21"
                      : pick === "英語で『りんご』は？" ? "apple"
                      : pick === "47都道府県の数は？" ? "47"
                      : pick === "水の化学式は？" ? "H2O"
                      : "3.1" },
          // お好みでメタ情報
          subject: "demo",
          unit: "sample",
          difficulty: ["easy","normal","hard"][Math.floor(Math.random()*3)],
        };
        await addDoc(collection(db, "mistakes"), docData);
      }
      // 反映
      await loadStats(uid);
      if (!live) await reloadPage();
      alert(`${count} 件追加しました`);
    } catch (e) {
      console.error("[mistakes seed] add error", e);
      alert("作成に失敗: " + e);
    }
   }


  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Mistakes Review</h1>
      </div>

      {/* 集計表示 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border rounded p-3 bg-white shadow-sm">
          <div className="text-xs text-gray-500">総数</div>
          <div className="text-lg font-bold">{stats.total}</div>
        </div>
        <div className="border rounded p-3 bg-white shadow-sm">
          <div className="text-xs text-gray-500">未復習</div>
          <div className="text-lg font-bold text-red-600">{stats.unreviewed}</div>
        </div>
        <div className="border rounded p-3 bg-white shadow-sm">
          <div className="text-xs text-gray-500">分かった(Got)</div>
          <div className="text-lg font-bold text-green-600">{stats.got}</div>
        </div>
        <div className="border rounded p-3 bg-white shadow-sm">
          <div className="text-xs text-gray-500">もう一回(Retry)</div>
          <div className="text-lg font-bold text-yellow-600">{stats.retry}</div>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Got率: {stats.total ? Math.round((stats.got / stats.total)*100) : 0}%
      </div>

       <div className="flex items-center gap-4">
        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={showOnlyUnreviewed}
            onChange={(e) => { setShowOnlyUnreviewed(e.target.checked); }}
          />
          未復習のみ
        </label>
        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={live}
            onChange={(e) => setLive(e.target.checked)}
          />
          Live更新
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">件数</span>
          <select
            className="border px-2 py-1 text-sm rounded"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        {/* デモ投入（ログイン中のみ使用可） */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => addDummyMistakes(1)}
            className="border px-3 py-1 text-sm rounded hover:bg-gray-50"
            title="デモ用に1件追加"
          >
            +1件 追加
          </button>
          <button
            onClick={() => addDummyMistakes(10)}
            className="border px-3 py-1 text-sm rounded hover:bg-gray-50"
            title="デモ用に10件追加"
          >
            +10件 追加
          </button>
        </div>
      </div>

      {err && <div className="text-sm text-red-600">取得に失敗しました: {String(err)}</div>}
      {loading && <div className="text-sm text-gray-500">読み込み中…</div>}

      {!loading && items.length === 0 && (
        <div className="text-sm text-gray-600">対象の Mistakes はありません。</div>
      )}

      {!loading && items.length > 0 && (
        <>
          {/* ナビ */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {index+1} / {items.length}
              {cursor && (
                <button
                  onClick={loadMore}
                  className="ml-3 border px-2 py-1 text-xs rounded hover:bg-gray-50"
                >
                  さらに読み込む
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={prev} disabled={index===0} className={`border px-3 py-1 text-sm rounded ${index===0 ? "opacity-50":"hover:bg-gray-50"}`}>← 前</button>
              <button onClick={next} disabled={index===items.length-1} className={`border px-3 py-1 text-sm rounded ${index===items.length-1 ? "opacity-50":"hover:bg-gray-50"}`}>次 →</button>
            </div>
          </div>

          {/* カード */}
          <div className="border rounded-xl p-4 shadow-sm bg-white">
            <div className="text-xs text-gray-500 mb-2">
              id: {current.id} ／ 作成: {fmt(current.createdAt)} ／ 状態: {current.isReviewed ? "済" : "未"}
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-semibold mb-1">Question</div>
                <div className="text-base whitespace-pre-wrap">
                  {current.question?.text ?? current.q?.text ?? "-"}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold mb-1">Your Answer</div>
                <div className="text-base whitespace-pre-wrap">
                  {current.answer?.text ?? current.a?.text ?? "-"}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold mb-1">Correct</div>
                {!reveal ? (
                  <button
                    onClick={() => setReveal(true)}
                    className="border px-3 py-1 text-sm rounded hover:bg-gray-50"
                  >
                    答えを表示
                  </button>
                ) : (
                  <div className="text-base whitespace-pre-wrap">
                    {current.correct?.text ?? current.c?.text ?? "(no data)"}
                  </div>
                )}
              </div>
            </div>

            {/* アクション */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => markReviewed("got")}
                className="border px-3 py-2 text-sm rounded hover:bg-gray-50"
                title="理解できた！"
              >
                分かった！(Got it)
              </button>
              <button
                onClick={() => markReviewed("retry")}
                className="border px-3 py-2 text-sm rounded hover:bg-gray-50"
                title="もう少し練習"
              >
                もう一回（Retry）
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
