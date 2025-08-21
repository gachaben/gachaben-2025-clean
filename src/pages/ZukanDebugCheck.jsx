// src/pages/ZukanDebugCheck.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc,
  arrayUnion, serverTimestamp
} from "firebase/firestore";
import { db, auth, ensureSignedIn } from "../legacy_deprecated/firebase";

function Img({ src, alt }) {
  const [ok, setOk] = useState(true);
  return (
    <div className="w-[96px] h-[96px] bg-gray-50 border flex items-center justify-center rounded overflow-hidden">
      {/* 画像が無ければ×表示 */}
      {ok ? (
        <img
          src={src}
          alt={alt}
          className="object-contain w-full h-full"
          onError={() => setOk(false)}
        />
      ) : (
        <div className="text-[11px] text-gray-400 text-center p-1">
          no image<br />{src?.split("/").pop()}
        </div>
      )}
    </div>
  );
}

export default function ZukanDebugCheck() {
  const nav = useNavigate();

  const [uid, setUid] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [ownedIds, setOwnedIds] = useState([]);
  const [ownedItems, setOwnedItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState("");

  const append = (s) => setLog((t) => (t ? `${t}\n${s}` : s));

  // ユーザードキュメントを保証
  const ensureUserDoc = useCallback(async (uid) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { createdAt: serverTimestamp(), bpt: 0, items: [] });
    } else if (!Array.isArray(snap.data()?.items)) {
      await setDoc(ref, { items: [] }, { merge: true });
    }
    return ref;
  }, []);

  // 取得リフレッシュ
  const refresh = useCallback(async () => {
    try {
      setBusy(true);
      await ensureSignedIn();
      const cur = auth.currentUser;
      if (!cur) {
        append("❌ 未ログイン。/login からログインしてください");
        return;
      }
      setUid(cur.uid);
      append(`🔑 uid: ${cur.uid}`);

      // users/{uid}
      const uref = await ensureUserDoc(cur.uid);
      const usnap = await getDoc(uref);
      const udata = usnap.data() || {};
      setUserDoc(udata);
      const ids = Array.isArray(udata.items) ? udata.items : [];
      setOwnedIds(ids);
      append(`👤 users/${cur.uid} → items ${ids.length} 件, bpt: ${udata.bpt ?? 0}`);

      // items 全件
      const allSnap = await getDocs(collection(db, "items"));
      const all = allSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAllItems(all);
      append(`📦 items コレクション総数: ${all.length}`);

      // 所持品 詳細
      const owned = all.filter((it) => ids.includes(it.id));
      setOwnedItems(owned);
      append(`🎒 所持アイテム解決件数: ${owned.length}`);
    } catch (e) {
      console.error(e);
      append(`❌ エラー: ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  }, [append, ensureUserDoc]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 種データ投入（items に1件追加）
  const seedOneItem = async () => {
    try {
      setBusy(true);
      await ensureSignedIn();
      const ref = await addDoc(collection(db, "items"), {
        name: "カブト（S）",
        pw: 200,
        stage: 1,                   // 画像パス用
        imageName: "kabuto",        // /images/kontyu/stage1/kabuto.png を想定
        seriesId: "kontyu",
        rank: "S",
        createdAt: serverTimestamp(),
      });
      append(`✅ items に1件追加: ${ref.id}`);
      await refresh();
    } catch (e) {
      console.error(e);
      append(`❌ seed 失敗: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  // さっき追加した items の最新1件をユーザー所持に付与
  const giveLastToUser = async () => {
    try {
      setBusy(true);
      await ensureSignedIn();
      const cur = auth.currentUser;
      const allSnap = await getDocs(collection(db, "items"));
      if (allSnap.empty) {
        append("❗ items が空です（まず『種データを1件追加』を押してね）");
        return;
      }
      const lastId = allSnap.docs[allSnap.docs.length - 1].id;
      const uref = await ensureUserDoc(cur.uid);
      await updateDoc(uref, { items: arrayUnion(lastId) });
      append(`✅ users/${cur.uid}.items に ${lastId} を追加`);
      await refresh();
    } catch (e) {
      console.error(e);
      append(`❌ 付与失敗: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const gotoList = () => nav("/zukan/list", { state: { highlightBpt: true } });
  const gotoSeriesS = () => nav("/zukan/kontyu/S", { state: { highlightBpt: true } });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">図鑑チェック＆シーダー</h1>
        <Link to="/" className="text-blue-600 underline">ホームへ</Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={refresh} disabled={busy} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50">再読込</button>
        <button onClick={seedOneItem} disabled={busy} className="px-3 py-1 rounded bg-emerald-600 text-white disabled:opacity-50">items に種データを1件追加</button>
        <button onClick={giveLastToUser} disabled={busy} className="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50">最新アイテムを所持に付与</button>
        <button onClick={gotoList} className="px-3 py-1 rounded bg-blue-600 text-white">図鑑一覧を開く (/zukan/list)</button>
        <button onClick={gotoSeriesS} className="px-3 py-1 rounded bg-pink-600 text-white">シリーズSを開く (/zukan/kontyu/S)</button>
      </div>

      <section className="p-3 border rounded">
        <div className="font-semibold mb-2">ユーザー情報</div>
        <div className="text-sm">uid: {uid || "—"}</div>
        <div className="text-sm">bpt: {userDoc?.bpt ?? 0}</div>
        <div className="text-sm">items配列: {ownedIds.length} 件</div>
      </section>

      <section className="p-3 border rounded">
        <div className="font-semibold mb-2">所持アイテム（解決済み）</div>
        {ownedItems.length === 0 ? (
          <div className="text-sm text-gray-500">まだ所持アイテムがありません。</div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,140px)] gap-3">
            {ownedItems.map((it) => (
              <div key={it.id} className="border rounded p-2 text-xs">
                <Img src={`/images/kontyu/stage${it.stage}/${(it.imageName || "").replace(".png","")}.png`} alt={it.name} />
                <div className="mt-1 font-semibold">{it.name}</div>
                <div>pw: {it.pw}</div>
                <div>stage: {it.stage}</div>
                <div>id: <span className="text-[10px]">{it.id}</span></div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="p-3 border rounded">
        <div className="font-semibold mb-2">items コレクション（全件）</div>
        {allItems.length === 0 ? (
          <div className="text-sm text-gray-500">items が空です。</div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,140px)] gap-3">
            {allItems.map((it) => (
              <div key={it.id} className="border rounded p-2 text-xs">
                <Img src={`/images/kontyu/stage${it.stage}/${(it.imageName || "").replace(".png","")}.png`} alt={it.name} />
                <div className="mt-1 font-semibold">{it.name}</div>
                <div>pw: {it.pw}</div>
                <div>stage: {it.stage}</div>
                <div>id: <span className="text-[10px]">{it.id}</span></div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="p-3 border rounded">
        <div className="font-semibold mb-2">ログ</div>
        <pre className="text-xs whitespace-pre-wrap">{log}</pre>
      </section>
    </div>
  );
}
