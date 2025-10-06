// src/pages/ReviewMistakesPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
  limit,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";

const auth = getFirebaseAuth();
const db = getFirestoreDb();

function fmt(ts) {
  if (!ts) return "-";
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString("ja-JP");
  } catch {
    return "-";
  }
}

// 互換: status / isReviewed / reviewStatus から「未復習か」を求める
function isUnreviewed(m) {
  if (typeof m?.status === "string") return m.status === "open";
  if (typeof m?.isReviewed === "boolean") return !m.isReviewed;
  return true; // フィールドが無い古いデータは一旦「未復習」とみなす
}

// 互換: 集計用の状態名を返す "unreviewed" | "got" | "retry" | "reviewed"
function normalizeReviewState(m) {
  if (typeof m?.status === "string") {
    return m.status === "open" ? "unreviewed" : "reviewed";
  }
  if (m?.isReviewed) {
    if (m?.reviewStatus === "got") return "got";
    if (m?.reviewStatus === "retry") return "retry";
    return "reviewed";
  }
  return "unreviewed";
}

export default function ReviewMistakesPage() {
  const navigate = useNavigate();
  const [uid, setUid] = useState(null);
<<<<<<< HEAD

  // 集計
  const [stats, setStats] = useState({ total: 0, unreviewed: 0, got: 0, retry: 0 });

  // フィルタ
  const [showOnlyUnreviewed, setShowOnlyUnreviewed] = useState(true);
  const [live, setLive] = useState(true);
  const [pageSize, setPageSize] = useState(20);

  // 追加フィルタ（科目/単元）
  const [subject, setSubject] = useState(""); // ""=すべて
  const [unit, setUnit] = useState("");       // ""=すべて
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);

  // 取得データ
=======
  const [items, setItems] = useState([]);
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUid(null);
        setItems([]);
        setLoading(false);
        return;
      }
      setUid(u.uid);
<<<<<<< HEAD
      loadStats(u.uid);
      loadFacets(u.uid); // 科目/単元の候補をロード
=======

      // Mistakes購読
      const q = query(
        collection(db, "mistakes"),
        where("userId", "==", u.uid),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const un = onSnapshot(q, (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
      return un;
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)
    });
    return () => unsub();
  }, []);

<<<<<<< HEAD
  // 科目/単元の候補をロード（自分のmistakes全体からユニーク抽出）
  async function loadFacets(uid) {
    try {
      const qAll = query(collection(db, "mistakes"), where("uid", "==", uid));
      const snap = await getDocs(qAll);
      const subs = new Set();
      const units = new Set();
      snap.forEach((d) => {
        const m = d.data() || {};
        if (m.subject) subs.add(String(m.subject));
        if (m.unit) units.add(String(m.unit));
      });
      setSubjectOptions(["", ...Array.from(subs).sort()]);
      setUnitOptions(["", ...Array.from(units).sort()]);
    } catch (e) {
      console.error("[mistakes facets]", e);
    }
  }

  async function loadStats(uid) {
    try {
      const qAll = query(collection(db, "mistakes"), where("uid", "==", uid));
      const snap = await getDocs(qAll);
      let total = 0, unreviewed = 0, got = 0, retry = 0;
      snap.forEach((d) => {
        total++;
        const m = d.data() || {};
        const st = normalizeReviewState(m);
        if (st === "unreviewed") unreviewed++;
        else if (st === "got") got++;
        else if (st === "retry") retry++;
      });
      setStats({ total, unreviewed, got, retry });
    } catch (e) {
      console.error("[mistakes stats]", e);
    }
  }

  // 一覧クエリ（ユーザー＋任意のsubject/unit）
  // ※ status / isReviewed の混在に対応するため、クエリでは userId と createdAt のみ絞り込み
  const qBase = useMemo(() => {
    if (!uid) return null;
    const conds = [where("userId", "==", uid)];
    // subject/unit はクエリ条件に入れてOK（存在しない古いデータは落ちる点に注意）
    if (subject) conds.push(where("subject", "==", subject));
    if (unit) conds.push(where("unit", "==", unit));
    return query(collection(db, "mistakes"), ...conds, orderBy("createdAt", "desc"), limit(pageSize));
  }, [uid, pageSize, subject, unit]);

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
              let list = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
              // 未復習フィルタはクライアントで
              if (showOnlyUnreviewed) list = list.filter(isUnreviewed);
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
          let list = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
          if (showOnlyUnreviewed) list = list.filter(isUnreviewed);
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
  }, [qBase, live, showOnlyUnreviewed]);

  // 次のページ（単発読み込み）
  const loadMore = useCallback(async () => {
    if (!uid || !cursor) return;
    setLoading(true);
    setErr(null);
    try {
      const conds = [where("userId", "==", uid)];
      if (subject) conds.push(where("subject", "==", subject));
      if (unit) conds.push(where("unit", "==", unit));
      const qMore = query(
        collection(db, "mistakes"),
        ...conds,
        orderBy("createdAt", "desc"),
        startAfter(cursor),
        limit(pageSize)
      );
      const snap = await getDocs(qMore);
      let list = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
      if (showOnlyUnreviewed) list = list.filter(isUnreviewed);
      setItems((prev) => [...prev, ...list]);
      setCursor(list.length ? snap.docs[snap.docs.length - 1] : null);
    } catch (e) {
      console.error("[mistakes more]", e);
      setErr(e);
    } finally {
      setLoading(false);
    }
  }, [uid, cursor, showOnlyUnreviewed, pageSize, subject, unit]);

  const current = items[index] || null;

  const markReviewed = useCallback(
    async (status) => {
      if (!current) return;
      try {
        // 統一スキーマ: status="reviewed"
        // 互換フィールドも更新しておく
        await updateDoc(doc(db, "mistakes", current.id), {
          status: "reviewed",
          isReviewed: true,
          reviewStatus: status, // "got" | "retry"
          reviewedAt: serverTimestamp(),
        });
        setReveal(false);
        setIndex((i) => Math.min(i + 1, Math.max(items.length - 1, 0)));
        if (uid) loadStats(uid);
      } catch (e) {
        alert("更新に失敗: " + e);
      }
    },
    [current, items.length, uid]
  );

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
        "3×7 は？",
        "英語で『りんご』は？",
        "47都道府県の数は？",
        "水の化学式は？",
        "π(パイ)を小数第1位まで",
      ];
      for (let i = 0; i < count; i++) {
        const pick = textsQ[Math.floor(Math.random() * textsQ.length)];

        // 統一スキーマで作成
        const make = (overrides = {}) => ({
          userId: uid,
          question: pick,
          correctAnswer:
            pick === "3×7 は？"
              ? "21"
              : pick === "英語で『りんご』は？"
              ? "apple"
              : pick === "47都道府県の数は？"
              ? "47"
              : pick === "水の化学式は？"
              ? "H2O"
              : "3.1",
          options:
            pick === "3×7 は？"
              ? ["18", "20", "21", "24"]
              : pick === "英語で『りんご』は？"
              ? ["orange", "apple", "pine", "grape"]
              : pick === "47都道府県の数は？"
              ? ["45", "46", "47", "48"]
              : pick === "水の化学式は？"
              ? ["HO", "H2O", "O2", "CO2"]
              : ["3.0", "3.1", "3.2", "3.3"],
          status: "open",
          times: 1,
          subject: subject || "demo",
          unit: unit || "sample",
          difficulty: ["easy", "normal", "hard"][Math.floor(Math.random() * 3)],
          createdAt: serverTimestamp(),
          lastWrongAt: serverTimestamp(),
          ...overrides,
        });

        await addDoc(collection(db, "mistakes"), make());
      }
      // 集計更新
      await loadStats(uid);
      alert(`${count} 件追加しました`);
    } catch (e) {
      console.error("[mistakes seed] add error", e);
      alert("作成に失敗: " + e);
    }
  }

  // subject 変更時に unit をリセット（クロスフィルタの混乱を防止）
  useEffect(() => {
    setUnit("");
  }, [subject]);
=======
  if (loading) return <div className="p-4">読み込み中…</div>;
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Mistakes一覧</h1>

      {items.length === 0 && (
        <div className="p-4 border rounded bg-gray-50 text-gray-600">
          復習すべき問題はありません 🎉
        </div>
<<<<<<< HEAD
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
        Got率: {stats.total ? Math.round((stats.got / stats.total) * 100) : 0}%
      </div>

      {/* フィルタ群 */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={showOnlyUnreviewed}
            onChange={(e) => {
              setShowOnlyUnreviewed(e.target.checked);
            }}
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

        {/* 科目 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">科目</span>
          <select
            className="border px-2 py-1 text-sm rounded"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            {subjectOptions.map((s, i) => (
              <option key={i} value={s}>
                {s || "すべて"}
              </option>
            ))}
          </select>
        </div>

        {/* 単元 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">単元</span>
          <select
            className="border px-2 py-1 text-sm rounded"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            disabled={!subject && unitOptions.length === 0}
          >
            {["", ...unitOptions.filter((u) => u !== "")].map((u, i) => (
              <option key={i} value={u}>
                {u || "すべて"}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-gray-600">件数</span>
          <select
            className="border px-2 py-1 text-sm rounded"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* デモ投入（ログイン中の自分名義で追加） */}
        <div className="flex items-center gap-2">
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
              {index + 1} / {items.length}
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
              <button
                onClick={prev}
                disabled={index === 0}
                className={`border px-3 py-1 text-sm rounded ${
                  index === 0 ? "opacity-50" : "hover:bg-gray-50"
                }`}
              >
                ← 前
              </button>
              <button
                onClick={next}
                disabled={index === items.length - 1}
                className={`border px-3 py-1 text-sm rounded ${
                  index === items.length - 1 ? "opacity-50" : "hover:bg-gray-50"
                }`}
              >
                次 →
              </button>
            </div>
          </div>

          {/* カード */}
          <div className="border rounded-xl p-4 shadow-sm bg-white">
            <div className="text-xs text-gray-500 mb-2">
              id: {current.id} ／ 作成: {fmt(current.createdAt)} ／ 状態:{" "}
              {isUnreviewed(current) ? "未" : "済"}
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-semibold mb-1">Question</div>
                <div className="text-base whitespace-pre-wrap">
                  {/* 互換: question(string) or question.text */}
                  {current.question ?? current.question?.text ?? current.q?.text ?? "-"}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold mb-1">Your Answer</div>
                <div className="text-base whitespace-pre-wrap">
                  {/* 互換: answer(string) or answer.text */}
                  {current.answer ?? current.answer?.text ?? current.a?.text ?? "-"}
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
                    {/* 互換: correctAnswer(string) or correct.text */}
                    {current.correctAnswer ??
                      current.correct?.text ??
                      current.c?.text ??
                      "(no data)"}
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
=======
      )}

      {items.map((m) => (
        <div
          key={m.id}
          className="p-4 border rounded bg-white shadow-sm space-y-2"
        >
          <div className="text-sm text-gray-500">
            作成: {fmt(m.createdAt)} ／ 状態:{" "}
            {m.reviewStatus || "未復習"}
          </div>
          <div className="font-semibold">{m.text || m.question}</div>
          <button
            onClick={() => navigate(`/review/play/${m.id}`)}
            className="mt-2 px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            この問題で復習する
          </button>
        </div>
      ))}
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)
    </div>
  );
}
