// src/pages/ZukanSeriesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";
import ItemCard from "../components/ItemCard";
import { resolveImageBaseName } from "../utils/resolveImageName";

export default function ZukanSeriesPage() {
  const navigate = useNavigate();
  const { seriesId = "kontyu", rank = "S" } = useParams();

  const auth = getFirebaseAuth();
  const db = getFirestoreDb();

  const [authReady, setAuthReady] = useState(false);
  const [userItems, setUserItems] = useState([]);
  const [userItemPowers, setUserItemPowers] = useState({});
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [fixing, setFixing] = useState(false);

  // 未ログインなら匿名ログイン
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.error("anonymous sign-in error:", e);
        }
      } else {
        setAuthReady(true);
      }
    });
    return () => unsub();
  }, [auth]);

  // 取得
  const fetchAll = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setUserItems([]);
        setLoading(false);
        return;
      }

      const itemSnap = await getDoc(doc(db, "userItems", user.uid));
      const rawItems = itemSnap.exists() ? itemSnap.data() : {};

      const powersSnap = await getDocs(
        collection(db, "userItemPowers", user.uid, "items")
      );
      const powers = {};
      powersSnap.forEach((d) => {
        powers[d.id] = d.data();
      });
      setUserItemPowers(powers);

      const itemList = Object.entries(rawItems).map(([id, data]) => ({
        itemId: id,
        ...data,
        ...powers[id],
      }));
      setUserItems(itemList);
    } catch (e) {
      console.error("load error:", e);
      setUserItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authReady) fetchAll();
  }, [authReady]);

  // フィルタ
  const filteredItems = useMemo(
    () =>
      userItems.filter(
        (it) =>
          String(it.seriesId || "").toLowerCase() ===
            String(seriesId).toLowerCase() &&
          String(it.rank || "").toUpperCase() === String(rank).toUpperCase()
      ),
    [userItems, seriesId, rank]
  );

  // Seed：1件追加（実在ファイル名に合わせて）
  const handleSeed = async () => {
    try {
      setSeeding(true);
      const user = auth.currentUser;
      if (!user) return;

      await setDoc(
        doc(db, "userItems", user.uid),
        {
          kabuto_S_01: {
            seriesId: "kontyu",
            rank: "S",
            name: "カブトムシ",
            stage: 1, // stage1 に合わせる
            imageName: "2508_S_005_kabuto_stage1", // 実ファイル名（拡張子なし）
            pw: 300,
          },
        },
        { merge: true }
      );

      await setDoc(
        doc(db, "userItemPowers", user.uid, "items", "kabuto_S_01"),
        { pw: 300, cpt: 0, bpt: 0 },
        { merge: true }
      );

      await fetchAll();
    } catch (e) {
      console.error("seed error:", e);
    } finally {
      setSeeding(false);
    }
  };

  // 画像名を itemNames に合わせて自動修正（今表示中のフィルタ対象だけ）
  const fixImageNamesByMapping = async () => {
    try {
      setFixing(true);
      const user = auth.currentUser;
      if (!user) return;

      const updates = {};
      for (const it of filteredItems) {
        const base = resolveImageBaseName(it); // itemNames から導出
        if (!base) continue;
        const current = String(it.imageName || "").replace(".png", "");
        if (current !== base) {
          updates[it.itemId] = { imageName: base, stage: it.stage };
        }
      }

      if (Object.keys(updates).length === 0) {
        alert("修正対象はありません。すでに一致しています！");
        return;
      }

      await setDoc(doc(db, "userItems", user.uid), updates, { merge: true });
      await fetchAll();
      alert(`画像名を ${Object.keys(updates).length} 件 修正しました。`);
    } catch (e) {
      console.error("fix error:", e);
      alert("画像名の自動修正に失敗しました。コンソールを確認してください。");
    } finally {
      setFixing(false);
    }
  };

  // このアイテムでバトルへ（カード全体がボタン）
  const goBattleWith = (item) => {
    navigate("/battle", { state: { selectedItem: item } });
  };

  if (!authReady) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-3">
          {seriesId} シリーズ・{rank} ランクのアイテム一覧
        </h1>
        <p>ログイン準備中…</p>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-3">
          {seriesId} シリーズ・{rank} ランクのアイテム一覧
        </h1>
        <p>読み込み中…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">
        {seriesId} シリーズ・{rank} ランクのアイテム一覧
      </h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="px-3 py-2 rounded bg-emerald-600 text-white disabled:opacity-60"
        >
          {seeding ? "Seeding…" : "Seed（1件追加）"}
        </button>

        <button
          onClick={fixImageNamesByMapping}
          disabled={fixing}
          className="px-3 py-2 rounded bg-indigo-600 text-white disabled:opacity-60"
        >
          {fixing ? "修正中…" : "画像名を自動修正（itemNames）"}
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-gray-600">このランクのアイテムは見つかりません。</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {filteredItems.map((item) => (
            <button
              key={item.itemId}
              type="button"
              onClick={() => goBattleWith(item)}
              aria-label={`${item.name}でバトルする`}
              className="border rounded p-2 hover:shadow transition text-left cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-300"
              title="カードをクリックでバトルへ"
            >
              <ItemCard item={item} owned={true} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
