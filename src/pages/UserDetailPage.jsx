// src/pages/UserDetailPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc, getDoc, collection, query, where, orderBy, limit, onSnapshot, getDocs,
  updateDoc,
} from "firebase/firestore";
import { getFirestoreDb } from "@/firebase";
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
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${y}-${m}-${day} ${hh}:${mi}:${ss}`;
  } catch {
    return "-";
  }
}

export default function UserDetailPage() {
  const { uid } = useParams();

  // 基本情報
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [user, setUser] = useState(null);

  // タブとライブ切替
  const [tab, setTab] = useState("profile"); // profile | battles | mistakes
  const [live, setLive] = useState(true);

  // リスト（最新20件）
  const [battles, setBattles] = useState([]);
  const [mistakes, setMistakes] = useState([]);

  // ── ユーザー読み込み ───────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (!snap.exists()) throw new Error("not found");
        if (alive) setUser({ id: snap.id, ...(snap.data() || {}) });
      } catch (e) {
        console.error("[FBKIT] user detail error:", e);
        if (alive) setErr(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [uid]);

  // ── Battles/Mistakes のリスン or 単発読込 ───────────────────────
  useEffect(() => {
    if (!uid) return;

    const cleanup = [];

    // battles
    const qBattles = query(
      collection(db, "battles"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    if (live) {
      const unsub = onSnapshot(qBattles,
        (snap) => setBattles(snap.docs.map(d => ({ id: d.id, ...(d.data() || {}) }))),
        (e) => console.error("[FBKIT] battles listen error:", e)
      );
      cleanup.push(unsub);
    } else {
      (async () => {
        try {
          const snap = await getDocs(qBattles);
          setBattles(snap.docs.map(d => ({ id: d.id, ...(d.data() || {}) })));
        } catch (e) {
          console.error("[FBKIT] battles load error:", e);
        }
      })();
    }

    // mistakes
    const qMistakes = query(
      collection(db, "mistakes"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    if (live) {
      const unsub = onSnapshot(qMistakes,
        (snap) => setMistakes(snap.docs.map(d => ({ id: d.id, ...(d.data() || {}) }))),
        (e) => console.error("[FBKIT] mistakes listen error:", e)
      );
      cleanup.push(unsub);
    } else {
      (async () => {
        try {
          const snap = await getDocs(qMistakes);
          setMistakes(snap.docs.map(d => ({ id: d.id, ...(d.data() || {}) })));
        } catch (e) {
          console.error("[FBKIT] mistakes load error:", e);
        }
      })();
    }

    return () => cleanup.forEach(fn => fn && fn());
  }, [uid, live]);

  // displayNameLower 補完（任意ボタン）
  const canFillLower = useMemo(() => {
    if (!user) return false;
    const dn = user.displayName ?? "";
    const lower = user.displayNameLower ?? "";
    return dn && lower !== dn.toLowerCase();
  }, [user]);
  async function fillLower() {
    try {
      await updateDoc(doc(db, "users", uid), {
        displayNameLower: (user.displayName ?? "").toLowerCase(),
      });
      alert("displayNameLower を補完しました。再読み込みします。");
      location.reload();
    } catch (e) {
      alert("更新に失敗しました: " + e);
    }
  }

  if (err?.message === "not found" || (!loading && !user)) {
    return (
      <div className="p-4 space-y-2">
        <div className="text-red-600">ユーザーが見つかりません（id: {uid}）</div>
        <Link to="/history" className="text-blue-600 hover:underline text-sm">← History へ戻る</Link>
    </div>
    );
  }
  if (loading) return <div className="p-4">読み込み中…</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">User Detail</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={live} onChange={(e)=>setLive(e.target.checked)} />
            Live更新
          </label>
          {canFillLower && (
            <button onClick={fillLower} className="border px-3 py-1 text-sm rounded hover:bg-gray-50">
              displayNameLower を補完
            </button>
          )}
          <Link to="/history" className="text-blue-600 hover:underline text-sm">← History</Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {["profile","battles","mistakes"].map((t)=>(
          <button
            key={t}
            onClick={()=>setTab(t)}
            className={`px-3 py-1 text-sm rounded border ${tab===t?"bg-blue-50 border-blue-300":"hover:bg-gray-50"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab==="profile" && (
       <div className="space-y-4">
          <table className="border min-w-[600px]">
            <tbody>
              <tr><th className="border px-2 py-1 text-left">id</th><td className="border px-2 py-1">{user.id}</td></tr>
              <tr><th className="border px-2 py-1 text-left">displayName</th><td className="border px-2 py-1">{user.displayName ?? "-"}</td></tr>
              <tr><th className="border px-2 py-1 text-left">displayNameLower</th><td className="border px-2 py-1">{user.displayNameLower ?? "-"}</td></tr>
              <tr><th className="border px-2 py-1 text-left">email</th><td className="border px-2 py-1">{user.email ?? "-"}</td></tr>
              <tr><th className="border px-2 py-1 text-left">role</th><td className="border px-2 py-1">{user.role ?? "-"}</td></tr>
              <tr><th className="border px-2 py-1 text-left">createdAt</th><td className="border px-2 py-1">{fmt(user.createdAt)}</td></tr>
              <tr><th className="border px-2 py-1 text-left">lastLoginAt</th><td className="border px-2 py-1">{fmt(user.lastLoginAt)}</td></tr>
            </tbody>
          </table>

          {/* role編集フォーム */}
          <div className="border p-3 rounded space-y-2">
            <label className="text-sm font-semibold">Role 編集</label>
            <div className="flex gap-2">
              {["user","admin","banned"].map(r=>(
                <button
                  key={r}
                  onClick={async ()=>{
                    try {
                      await updateDoc(doc(db,"users",uid),{ role:r });
                      alert(`roleを ${r} に変更しました。再読み込みします。`);
                      location.reload();
                    } catch(e) {
                      alert("更新失敗: "+e);
                    }
                  }}
                  className={`px-3 py-1 rounded border text-sm ${
                    user.role===r ? "bg-blue-100 border-blue-400" : "hover:bg-gray-50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>  


      )}

      {tab==="battles" && (
        <div className="space-y-2">
          <h2 className="font-semibold">Latest Battles (20)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left text-xs font-semibold border-b">id</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold border-b">winner</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold border-b">roundsPlayed</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold border-b">start</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold border-b">end</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold border-b">createdAt</th>
                </tr>
              </thead>
              <tbody>
                {battles.map((b)=>(
                  <tr key={b.id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-3 py-2 text-sm border-b break-all">{b.id}</td>
                    <td className="px-3 py-2 text-sm border-b">{b.winner ?? "-"}</td>
                    <td className="px-3 py-2 text-sm border-b">{b.roundsPlayed ?? "-"}</td>
                    <td className="px-3 py-2 text-sm border-b">{b.start ?? "-"}</td>
                    <td className="px-3 py-2 text-sm border-b">{b.end ?? "-"}</td>
                    <td className="px-3 py-2 text-sm border-b">{fmt(b.createdAt)}</td>
                  </tr>
                ))}
                {!battles.length && <tr><td className="px-3 py-2 text-sm border-b" colSpan={6}>データがありません。</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="mistakes" && (
        <div className="space-y-2">
          <h2 className="font-semibold">Latest Mistakes (20)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left text-xs font-semibold border-b">id</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold border-b">type</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold border-b">question</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold border-b">createdAt</th>
                </tr>
              </thead>
              <tbody>
                {mistakes.map((m)=>(
                  <tr key={m.id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-3 py-2 text-sm border-b break-all">{m.id}</td>
                    <td className="px-3 py-2 text-sm border-b">{m.type ?? "-"}</td>
                    <td className="px-3 py-2 text-sm border-b">{(m.question?.text ?? m.q?.text ?? "-").slice(0,50)}</td>
                    <td className="px-3 py-2 text-sm border-b">{fmt(m.createdAt)}</td>
                  </tr>
                ))}
                {!mistakes.length && <tr><td className="px-3 py-2 text-sm border-b" colSpan={4}>データがありません。</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
