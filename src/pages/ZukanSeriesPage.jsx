// src/pages/ZukanSeriesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/fbkit";
import ItemCard from "../components/ItemCard";
import { resolveImageBaseName } from "../utils/resolveImageName";

export default function ZukanSeriesPage() {
  const navigate = useNavigate();
  const { seriesId = "kontyu", rank = "S" } = useParams();

  const [authReady, setAuthReady] = useState(false);
  const [userItems, setUserItems] = useState([]);
  const [userItemPowers, setUserItemPowers] = useState({});
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [fixing, setFixing] = useState(false);

  // 譛ｪ繝ｭ繧ｰ繧､繝ｳ縺ｪ繧牙諺蜷阪Ο繧ｰ繧､繝ｳ
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.error(e);
        }
      } else {
        setAuthReady(true);
      }
    });
    return () => unsub();
  }, []);

  // 蜿門ｾ・
  const fetchAll = async () => {
    setLoading(true);
    try {
      const user = getAuth().currentUser;
      if (!user) {
        setUserItems([]);
        setLoading(false);
        return;
      }

      const itemSnap = await getDoc(doc(db, "userItems", user.uid));
      const rawItems = itemSnap.exists() ? itemSnap.data() : {};

      const powersSnap = await getDocs(collection(db, "userItemPowers", user.uid, "items"));
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

  // 繝輔ぅ繝ｫ繧ｿ
  const filteredItems = useMemo(
    () =>
      userItems.filter(
        (it) =>
          String(it.seriesId || "").toLowerCase() === String(seriesId).toLowerCase() &&
          String(it.rank || "").toUpperCase() === String(rank).toUpperCase()
      ),
    [userItems, seriesId, rank]
  );

  // Seed・・莉ｶ霑ｽ蜉・壼ｮ溷惠繝輔ぃ繧､繝ｫ蜷阪↓蜷医ｏ縺帙※・・
  const handleSeed = async () => {
    try {
      setSeeding(true);
      const user = getAuth().currentUser;
      if (!user) return;

      await setDoc(
        doc(db, "userItems", user.uid),
        {
          kabuto_S_01: {
            seriesId: "kontyu",
            rank: "S",
            name: "繧ｫ繝悶ヨ・・・・,
            stage: 1,                               // 竊・stage1 縺ｫ蜷医ｏ縺帙ｋ
            imageName: "2508_S_005_kabuto_stage1", // 竊・螳溘ヵ繧｡繧､繝ｫ蜷搾ｼ域僑蠑ｵ蟄舌↑縺暦ｼ・
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

  // 逕ｻ蜒丞錐繧・itemNames 縺ｫ蜷医ｏ縺帙※閾ｪ蜍穂ｿｮ豁｣・井ｻ願｡ｨ遉ｺ荳ｭ縺ｮ繝輔ぅ繝ｫ繧ｿ蟇ｾ雎｡縺縺托ｼ・
  const fixImageNamesByMapping = async () => {
    try {
      setFixing(true);
      const user = getAuth().currentUser;
      if (!user) return;

      const updates = {};
      for (const it of filteredItems) {
        const base = resolveImageBaseName(it); // itemNames 縺九ｉ蟆主・
        if (!base) continue;
        const current = String(it.imageName || "").replace(".png", "");
        if (current !== base) {
          updates[it.itemId] = { imageName: base, stage: it.stage };
        }
      }

      if (Object.keys(updates).length === 0) {
        alert("菫ｮ豁｣蟇ｾ雎｡縺ｯ縺ゅｊ縺ｾ縺帙ｓ・医☆縺ｧ縺ｫ荳閾ｴ縺励※縺・∪縺呻ｼ・);
        return;
      }

      await setDoc(doc(db, "userItems", user.uid), updates, { merge: true });
      await fetchAll();
      alert(`逕ｻ蜒丞錐繧・${Object.keys(updates).length} 莉ｶ 菫ｮ豁｣縺励∪縺励◆縲Ａ);
    } catch (e) {
      console.error("fix error:", e);
      alert("逕ｻ蜒丞錐縺ｮ閾ｪ蜍穂ｿｮ豁｣縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲ゅさ繝ｳ繧ｽ繝ｼ繝ｫ繧堤｢ｺ隱阪＠縺ｦ縺上□縺輔＞縲・);
    } finally {
      setFixing(false);
    }
  };

  // 縺薙・繧｢繧､繝・Β縺ｧ繝舌ヨ繝ｫ縺ｸ・医き繝ｼ繝牙・菴薙′繝懊ち繝ｳ・・
  const goBattleWith = (item) => {
    navigate("/battle", { state: { selectedItem: item } });
  };

  if (!authReady) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-3">
          {seriesId} 繧ｷ繝ｪ繝ｼ繧ｺ繝ｻ{rank} 繝ｩ繝ｳ繧ｯ縺ｮ繧｢繧､繝・Β荳隕ｧ
        </h1>
        <p>繝ｭ繧ｰ繧､繝ｳ貅門ｙ荳ｭ窶ｦ</p>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-3">
          {seriesId} 繧ｷ繝ｪ繝ｼ繧ｺ繝ｻ{rank} 繝ｩ繝ｳ繧ｯ縺ｮ繧｢繧､繝・Β荳隕ｧ
        </h1>
        <p>隱ｭ縺ｿ霎ｼ縺ｿ荳ｭ窶ｦ</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">
        {seriesId} 繧ｷ繝ｪ繝ｼ繧ｺ繝ｻ{rank} 繝ｩ繝ｳ繧ｯ縺ｮ繧｢繧､繝・Β荳隕ｧ
      </h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="px-3 py-2 rounded bg-emerald-600 text-white disabled:opacity-60"
        >
          {seeding ? "Seeding窶ｦ" : "Seed・・莉ｶ霑ｽ蜉・・}
        </button>

        <button
          onClick={fixImageNamesByMapping}
          disabled={fixing}
          className="px-3 py-2 rounded bg-indigo-600 text-white disabled:opacity-60"
        >
          {fixing ? "菫ｮ豁｣荳ｭ窶ｦ" : "逕ｻ蜒丞錐繧定・蜍穂ｿｮ豁｣・・temNames・・}
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-gray-600">縺薙・繝ｩ繝ｳ繧ｯ縺ｮ繧｢繧､繝・Β縺ｯ隕九▽縺九ｊ縺ｾ縺帙ｓ縲・/p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {filteredItems.map((item) => (
            <button
              key={item.itemId}
              type="button"
              onClick={() => goBattleWith(item)}
              aria-label={`${item.name}縺ｧ繝舌ヨ繝ｫ縺吶ｋ`}
              className="border rounded p-2 hover:shadow transition text-left cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-300"
              title="繧ｫ繝ｼ繝峨ｒ繧ｯ繝ｪ繝・け縺ｧ繝舌ヨ繝ｫ縺ｸ"
            >
              <ItemCard item={item} owned={true} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
