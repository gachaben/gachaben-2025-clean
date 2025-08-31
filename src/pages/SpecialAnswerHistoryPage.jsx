// src/pages/SpecialAnswerHistoryPage.jsx
import { useEffect, useState } from "react";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function SpecialAnswerHistoryPage() {
  const [logs, setLogs] = useState([]);
  const [questionsMap, setQuestionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showOnlyWrong, setShowOnlyWrong] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getFirestoreDb();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        alert("ログインしてください");
        setLoading(false);
        return;
      }

      try {
        // 回答ログ取得
        const logsQuery = query(
          collection(db, "specialAnswerLogs"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc")
        );
        const logsSnap = await getDocs(logsQuery);
        const logsData = logsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setLogs(logsData);

        // 問題データ取得（全文検索で OK：件数が多くなれば最適化検討）
        const qSnap = await getDocs(collection(db, "specialQuestions"));
        const qMap = {};
        qSnap.docs.forEach((d) => {
          qMap[d.id] = d.data();
        });
        setQuestionsMap(qMap);
      } catch (error) {
        console.error("データ取得エラー:", error);
        alert("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>読み込み中...</p>;

  const filteredLogs = showOnlyWrong ? logs.filter((log) => log.isCorrect === false) : logs;

  return (
    <div style={{ padding: 16 }}>
      <h2>📘 回答履歴</h2>

      <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <input
          type="checkbox"
          checked={showOnlyWrong}
          onChange={(e) => setShowOnlyWrong(e.target.checked)}
        />
        <span>まちがったものだけを表示</span>
      </label>

      {filteredLogs.length === 0 ? (
        <p>表示できる履歴がありません。</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredLogs.map((log, i) => {
            const q = questionsMap[log.questionId];
            const isCorrect = !!log.isCorrect;

            // 選択肢テキストの安全取得
            let chosenText = "-";
            if (q?.choices && Number.isInteger(log.selectedIndex) && q.choices[log.selectedIndex] != null) {
              chosenText = q.choices[log.selectedIndex];
            }

            return (
              <li
                key={log.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  margin: "10px 0",
                  padding: "10px",
                  backgroundColor: isCorrect ? "#e6ffed" : "#ffecec",
                }}
              >
                <p style={{ margin: "0 0 6px" }}>
                  <strong>Q{i + 1}.</strong>{" "}
                  {q ? q.question : "（この問題は削除された可能性があります）"}
                </p>

                <p style={{ margin: "0 0 6px" }}>
                  あなたの答え： <strong>{chosenText}</strong>{" "}
                  {isCorrect ? "⭕ 正解" : "❌ 不正解"}
                </p>

                <p style={{ fontSize: "0.9em", color: "#555", margin: 0 }}>
                  {log.timestamp?.toDate?.().toLocaleString() || "日付なし"}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
