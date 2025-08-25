import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const SpecialAnswerHistoryPage = () => {
  const [logs, setLogs] = useState([]);
  const [questionsMap, setQuestionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showOnlyWrong, setShowOnlyWrong] = useState(false);

  useEffect(() => {
    const auth = getAuth();
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
        const logsData = logsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLogs(logsData);

        // 問題データ取得
        const qSnap = await getDocs(collection(db, "specialQuestions"));
        const qMap = {};
        qSnap.docs.forEach((doc) => {
          qMap[doc.id] = doc.data();
        });
        setQuestionsMap(qMap);
      } catch (error) {
        console.error("データ取得エラー：", error);
        alert("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe(); // クリーンアップ
  }, []);

  if (loading) return <p>読み込み中...</p>;

  const filteredLogs = showOnlyWrong
    ? logs.filter((log) => log.isCorrect === false)
    : logs;

  return (
    <div>
      <h2>📘 回答履歴</h2>
      <label>
        <input
          type="checkbox"
          checked={showOnlyWrong}
          onChange={(e) => setShowOnlyWrong(e.target.checked)}
        />
        ❌ まちがったもんだい だけを表示
      </label>

      {filteredLogs.length === 0 ? (
        <p>表示できる履歴がありません。</p>
      ) : (
        <ul>
          {filteredLogs.map((log, i) => {
            const question = questionsMap[log.questionId];
            const isCorrect = log.isCorrect;

            return (
              <li
                key={log.id}
                style={{
                  border: "1px solid #ccc",
                  margin: "10px 0",
                  padding: "10px",
                  backgroundColor: isCorrect ? "#e0ffe0" : "#ffe0e0",
                }}
              >
                <p>
                  <strong>Q{i + 1}.</strong>{" "}
                  {question ? question.question : "（問題が削除されています）"}
                </p>
                <p>
                  あなたのこたえ：{" "}
                  <strong>{question ? question.choices[log.selectedIndex] : "？"}</strong>（
                  {isCorrect ? "⭕せいかい" : "❌まちがい"}）
                </p>
                <p style={{ fontSize: "0.9em", color: "#555" }}>
                  {log.timestamp?.toDate?.().toLocaleString() || "日付なし"}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SpecialAnswerHistoryPage;
