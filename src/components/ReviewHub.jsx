import React from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
import { auth } from "../firebase";

export default function ReviewHub() {
  const [counts, setCounts] = React.useState({ battle: 0, challenge: 0 });
  const uid = auth.currentUser?.uid ?? "anon";

  React.useEffect(() => {
    const base = collection(db, "mistakes");
    const q1 = query(base, where("uid", "==", uid), where("status", "==", "pending"), where("source", "==", "battle"));
    const q2 = query(base, where("uid", "==", uid), where("status", "==", "pending"), where("source", "==", "challenge"));

    const unsubs = [
      onSnapshot(q1, (s) => setCounts((c) => ({ ...c, battle: s.size }))),
      onSnapshot(q2, (s) => setCounts((c) => ({ ...c, challenge: s.size }))),
    ];
    return () => unsubs.forEach((u) => u());
  }, [uid]);

  const total = counts.battle + counts.challenge;

  return (
    <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 12, marginTop: 12 }}>
      <div style={{ fontWeight: 600 }}>復習キュー</div>
      <div style={{ marginTop: 6, fontSize: 14 }}>
        バトル: {counts.battle} 件 / チャレンジ: {counts.challenge} 件
      </div>
      <div style={{ marginTop: 8 }}>
        <Link to="/review" style={{ opacity: total ? 1 : 0.6, pointerEvents: total ? "auto" : "none" }}>
          復習を始める（{total}）
        </Link>
      </div>
    </div>
  );
}
