// src/pages/ReviewQuickStart.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth, ensureSignedIn } from "../firebase";

export default function ReviewQuickStart() {
  const [raw, setRaw] = useState([]);
  const [state, setState] = useState("loading");
  const [msg, setMsg] = useState("");

  const [qText, setQText] = useState("");
  const [sort, setSort] = useState("new");
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [subject, setSubject] = useState("");
  const [unit, setUnit] = useState("");

  const navigate = useNavigate();

  // 初期購読
  useEffect(() => {
    let unsub = () => {};
    (async () => {
      try {
        await ensureSignedIn();
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error("not signed in");

        const qy = query(
          collection(db, "mistakes"),
          where("uid", "==", uid),
          orderBy("createdAt", "desc")
        );

        unsub = onSnapshot(
          qy,
          (snap) => {
            const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setRaw(arr);
            setState(arr.length ? "ready" : "empty");
          },
          (err) => {
            setMsg(err.message);
            setState("error");
          }
        );
      } catch (e) {
        setMsg(e.message);
        setState("error");
      }
    })();
    return () => unsub();
  }, []);

  // 科目/単元の選択肢
  const subjects = useMemo(() => {
    const s = new Set(raw.map((x) => x.subject).filter(Boolean));
    return Array.from(s);
  }, [raw]);

  const units = useMemo(() => {
    const s = new Set(
      raw
        .filter((x) => !subject || x.subject === subject)
        .map((x) => x.unit)
        .filter(Boolean)
    );
    return Array.from(s);
  }, [raw, subject]);

  // 表示リスト
  const items = useMemo(() => {
    let arr = [...raw];

    if (subject) arr = arr.filter((x) => x.subject === subject);
    if (unit) arr = arr.filter((x) => x.unit === unit);
    if (onlyOpen) arr = arr.filter((x) => !x.done);

    const needle = qText.trim().toLowerCase();
    if (needle) {
      arr = arr.filter(
        (x) =>
          (x.text || "").toLowerCase().includes(needle) ||
          (x.questionId || "").toLowerCase().includes(needle)
      );
    }

    if (sort === "new") {
      arr.sort(
        (a, b) =>
          (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
      );
    } else if (sort === "old") {
      arr.sort(
        (a, b) =>
          (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0)
      );
    } else if (sort === "random") {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    return arr;
  }, [raw, subject, unit, onlyOpen, qText, sort]);

  // 完了フラグ
  const markDone = async (id) => {
    try {
      await updateDoc(doc(db, "mistakes", id), {
        done: true,
        doneAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("markDone failed:", e);
      alert("完了にできませんでした");
    }
  };

  if (state === "loading") return <div className="p-4">読み込み中…</div>;
  if (state === "error") return <div className="p-4 text-red-600">Error: {msg}</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-3">
      <h2 className="text-xl font-bold">復習モード</h2>

      {/* コントロールバー */}
      <div className="flex flex-wrap gap-2 items-center p-3 border rounded bg-white">
        <select
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setUnit("");
          }}
          className="px-3 py-2 border rounded"
        >
          <option value="">すべての科目</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="px-3 py-2 border rounded"
          disabled={!subject}
        >
          <option value="">すべての単元</option>
          {units.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>

        <input
          value={qText}
          onChange={(e) => setQText(e.target.value)}
          placeholder="問題文・IDで検索"
          className="px-3 py-2 border rounded flex-1 min-w-[200px]"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="new">新しい順</option>
          <option value="old">古い順</option>
          <option value="random">ランダム</option>
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(e) => setOnlyOpen(e.target.checked)}
          />
          未復習のみ表示
        </label>

        <div className="text-xs text-gray-500 ml-auto">
          表示 {items.length} 件（全 {raw.length} 件）
        </div>
      </div>

      {items.length === 0 && state === "empty" && (
        <div className="border rounded p-4 bg-white">
          <div className="font-semibold mb-1">復習項目はまだありません</div>
          <div className="text-sm text-gray-600">
            いちどバトルで間違えると、ここに表示されます。
          </div>
        </div>
      )}
      {items.length === 0 && state === "ready" && (
        <div className="border rounded p-4 bg-white">
          <div className="font-semibold mb-1">表示できる項目がありません</div>
          <div className="text-sm text-gray-600">
            フィルタ条件（科目/単元/検索/未復習のみ）を調整してね。
          </div>
        </div>
      )}

      {items.map((m) => (
        <div key={m.id} className="p-3 border rounded bg-white">
          <div className="text-xs text-gray-500 mb-1 flex flex-wrap gap-2">
            <span>問題ID: {m.questionId}</span>
            <span>／ 追加: {m.createdAt?.toDate?.().toLocaleString?.() ?? "…"}</span>
            {m.done && (
              <span>／ 完了: {m.doneAt?.toDate?.().toLocaleString?.() ?? "…"}</span>
            )}
          </div>

          <div className="mb-1 flex flex-wrap gap-2 text-xs">
            {m.subject && (
              <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                科目: {m.subject}
              </span>
            )}
            {m.unit && (
              <span className="px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
                単元: {m.unit}
              </span>
            )}
          </div>

          <div className="font-semibold mb-1">{m.text || "（問題文なし）"}</div>
          <div className="text-sm text-gray-700 mb-3">
            あなたの答え: <b>{m.choice}</b> ／ 正解: <b>{m.correct}</b>
          </div>

          <div className="flex gap-8 items-center">
            <button
              className="px-3 py-2 rounded bg-emerald-600 text-white"
              onClick={() => {
                navigate(`/review/play/${encodeURIComponent(m.questionId)}`, {
                  state: {
                    mistakeId: m.id,
                    text: m.text ?? "",
                    correct: m.correct ?? "",
                    subject: m.subject ?? null,
                    unit: m.unit ?? null,
                    options: m.options ?? null,   // ← 追加
                  },
                });
              }}
            >
              この問題で復習する
            </button>

            {!m.done ? (
              <button
                onClick={() => markDone(m.id)}
                className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
              >
                完了にする
              </button>
            ) : (
              <span className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                完了済み
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
