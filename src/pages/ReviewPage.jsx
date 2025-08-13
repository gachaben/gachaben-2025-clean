import React from "react";
import { db } from "../firebase";
import {
  collection, query, where, limit, getDocs, doc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { auth } from "../firebase";

function QuestionCard({ item, onAnswer }) {
  const q = item.snapshot ?? {};
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 12, opacity: 0.6 }}>
        source: {item.source} / timesWrong: {item.timesWrong ?? 1}
      </div>
      <div style={{ marginTop: 8, fontWeight: 600 }}>{q.text ?? `Q.${item.questionId}`}</div>
      <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
        {(q.choices ?? ["○ 正解", "× 不正解"]).map((c, i) => (
          <button key={i} onClick={() => onAnswer(i === (q.answerIndex ?? 0))}
                  style={{ padding: 8, borderRadius: 8 }}>
            {typeof c === "string" ? c : c.label ?? `選択肢${i+1}`}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const uid = auth.currentUser?.uid ?? "anon";
  const [item, setItem] = React.useState(null);
  const [done, setDone] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  async function fetchNext() {
    setLoading(true);
    const base = collection(db, "mistakes");
    // まず battle を優先 → 無ければ challenge
    const tryFetch = async (source) => {
      const q = query(base, where("uid", "==", uid), where("status", "==", "pending"), where("source", "==", source), limit(1));
      const s = await getDocs(q);
      return s.empty ? null : { id: s.docs[0].id, ...s.docs[0].data() };
    };

    const one = (await tryFetch("battle")) ?? (await tryFetch("challenge"));
    setItem(one);
    setDone(!one);
    setLoading(false);
  }

  React.useEffect(() => { fetchNext(); }, [uid]);

  async function onAnswer(isCorrect) {
    if (!item) return;
    // 正解→cleared、不正解→timesWrong+1（残す）
    const ref = doc(db, "mistakes", item.id);
    if (isCorrect) {
      await updateDoc(ref, { status: "cleared", lastTriedAt: serverTimestamp() });
    } else {
      await updateDoc(ref, { status: "pending", lastTriedAt: serverTimestamp(), timesWrong: (item.timesWrong ?? 1) + 1 });
    }
    await fetchNext();
  }

  if (loading) return <div style={{ padding: 16 }}>読み込み中…</div>;
  if (done) return <div style={{ padding: 16 }}>🎉 復習キューは空です！ガチャ解放！</div>;

  return (
    <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
      <h2>復習</h2>
      <QuestionCard item={item} onAnswer={onAnswer} />
    </div>
  );
}
