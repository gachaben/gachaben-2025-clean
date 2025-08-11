// src/pages/BattlePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
// import ItemCard from "../components/ItemCard"; // あれば使ってOK

export default function BattlePage() {
  const { id } = useParams();
  const [battle, setBattle] = useState(null);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1) battle doc をポーリングで取得
  useEffect(() => {
    if (!id) return;
    const ref = doc(db, "battles", id);
    let cancel = false;

    const tick = async () => {
      try {
        const snap = await getDoc(ref);
        if (cancel) return;
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setBattle(data);
          setLoading(false);
        } else {
          setBattle(null);
          setLoading(false);
        }
      } catch (e) {
        console.error("getDoc(battles) error:", e);
        setLoading(false);
      }
    };

    tick();
    const t = setInterval(tick, 1500);
    return () => { cancel = true; clearInterval(t); };
  }, [id]);

  // 2) アイテム情報を取得（items/<selectedItemId> を想定）
  useEffect(() => {
    const loadItem = async () => {
      if (!battle?.selectedItemId) return;
      try {
        const ref = doc(db, "items", battle.selectedItemId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setItem({ id: snap.id, ...snap.data() });
        } else {
          // Firestoreに無ければ、IDから画像パスを推測（暫定）
          // ex) 2508_S_002_ageha_stage4 → /images/kontyu/stage4/2508_S_002_ageha.png など
          setItem({
            id: battle.selectedItemId,
            name: battle.selectedItemId,
            imageSrcGuess: `/images/kontyu/stage4/${battle.selectedItemId.replace(/_stage\d+$/,'')}.png`,
          });
        }
      } catch (e) {
        console.error("getDoc(items) error:", e);
      }
    };
    loadItem();
  }, [battle?.selectedItemId]);

  if (loading) return <p>読み込み中...</p>;
  if (!battle)  return <p>バトルが見つかりません（id: {id}）。</p>;

  return (
    <div style={{ padding: 16 }}>
      <h1>Battle: {id}</h1>

      <section style={{ margin: "12px 0" }}>
        <h3>あなたのアイテム</h3>
        {/* ItemCard があるなら <ItemCard item={item} /> でOK */}
        {item?.image || item?.imageSrc ? (
          <img src={item.image || item.imageSrc} alt={item.name || item.id} style={{ width: 160 }} />
        ) : item?.imageSrcGuess ? (
          <img src={item.imageSrcGuess} alt={item.name || item.id} style={{ width: 160 }} />
        ) : (
          <div>{item ? (item.name || item.id) : "読み込み中..."}</div>
        )}
      </section>

      <pre>{JSON.stringify(battle, null, 2)}</pre>
    </div>
  );
}
